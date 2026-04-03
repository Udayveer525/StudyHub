// ollie/ollie.controller.js
const pool = require("../config/db");
const path = require("path");
const { chat } = require("./groq.client");
const { buildSystemPrompt, buildParsePrompt } = require("./prompt.builder");

// pdfjs-dist v4+ ships only .mjs files — no CommonJS .js build exists.
// We load it once via dynamic import() which works fine from a CommonJS module.
// The promise is cached so subsequent calls reuse the same module.
let _pdfjsPromise = null;
function getPdfjs() {
  if (!_pdfjsPromise)
    _pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  return _pdfjsPromise;
}

// ─── Language subjects to skip (no unit-based syllabus) ─────────────────────
const SKIP_SUBJECTS = [
  "english",
  "punjabi",
  "hindi",
  "history",
  "culture of punjab",
  "environment",
  "road safety",
  "drug abuse",
];

function isLanguageSubject(name) {
  const lower = name.toLowerCase();
  return SKIP_SUBJECTS.some((s) => lower.includes(s));
}

// ─── PDF extraction via pdfjs-dist (pure Node, no Python) ───────────────────
// Uses the same page-level structure detection as the Python version:
//   - "External Marks" only appears on real subject content pages, never in
//     scheme tables → reliable page-start signal
//   - Subject name is always the first line on its content page → exact match
//   - Multi-page subjects are collected until the next content page starts

/**
 * Extract text from one PDF page, reconstructing lines by Y-position grouping.
 * pdfjs gives us individual text items with coordinates — we group items at
 * the same Y into a single line, then sort top-to-bottom.
 */
async function extractPageText(pdfDoc, pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const content = await page.getTextContent();
  const byY = new Map();
  for (const item of content.items) {
    if (!item.str?.trim()) continue;
    const y = Math.round(item.transform[5]); // PDF Y axis is bottom-up
    if (!byY.has(y)) byY.set(y, []);
    byY.get(y).push(item.str);
  }
  return [...byY.entries()]
    .sort((a, b) => b[0] - a[0]) // descending Y = top to bottom
    .map(([, items]) => items.join(" ").trim())
    .filter((l) => l)
    .join("\n");
}

/** True if this page's text contains the content-page header marker. */
function isSubjectStart(pageText) {
  return (
    pageText.includes("External Marks") ||
    /\bL\b.*\bT\b.*\bP\b.*\bCr\b/.test(pageText)
  );
}

/**
 * True if the first meaningful line of pageText matches subjectName.
 * Only checks the first non-trivial line — that is always where the
 * subject name appears on content pages in this syllabus format.
 */
function nameMatches(pageText, subjectName) {
  const target = subjectName.trim().toLowerCase();
  const targetWords = target.split(/\W+/).filter((w) => w.length > 2);
  for (const line of pageText.split("\n").slice(0, 4)) {
    const l = line.trim().toLowerCase();
    if (!l || l === ":") continue; // skip OCR artifacts
    if (l === target) return true;
    // One-word tolerance: all target words present, line not much longer
    const hits = targetWords.filter((w) => l.includes(w)).length;
    if (hits === targetWords.length && line.trim().length <= subjectName.length + 15)
      return true;
    break; // only the first meaningful line counts
  }
  return false;
}

/**
 * Extract the full text section for a subject from a PDF file.
 * Returns the text string, or null if the subject page was not found.
 *
 * @param {string} pdfPath      - Absolute path to the uploaded PDF
 * @param {string} subjectName  - e.g. "Java Programming"
 */
async function extractSubjectSection(pdfPath, subjectName) {
  const { getDocument } = await getPdfjs();
  const data = new Uint8Array(require("fs").readFileSync(pdfPath));
  const pdfDoc = await getDocument({ data }).promise;

  // Extract all pages (parallel for speed)
  const pageTexts = await Promise.all(
    Array.from({ length: pdfDoc.numPages }, (_, i) =>
      extractPageText(pdfDoc, i + 1),
    ),
  );

  // Identify all content pages by the "External Marks" signal
  const contentPageIndices = new Set(
    pageTexts.map((t, i) => (isSubjectStart(t) ? i : -1)).filter((i) => i !== -1),
  );

  // Find the page matching our subject
  let targetIdx = -1;
  for (const i of contentPageIndices) {
    if (nameMatches(pageTexts[i], subjectName)) {
      targetIdx = i;
      break;
    }
  }

  if (targetIdx === -1) {
    console.warn(`[Ollie] Subject page not found for "${subjectName}"`);
    return null;
  }

  // Collect target page + any continuation pages (until next content page)
  const parts = [pageTexts[targetIdx]];
  for (let i = targetIdx + 1; i < pageTexts.length; i++) {
    if (contentPageIndices.has(i)) break;
    parts.push(pageTexts[i]);
  }

  const section = parts.join("\n").trim();
  console.log(`[Ollie] Extracted "${subjectName}": ${section.length} chars`);
  return section;
}

// ─── Helper: fetch full context for a user+syllabus combo ────────────────────
async function getContext(userId, syllabusId) {
  const syllabusRes = await pool.query(
    `SELECT s.*, sub.name AS subject_name, sub.code AS subject_code
     FROM ai_syllabi s
     JOIN subjects sub ON s.subject_id = sub.id
     WHERE s.id = $1`,
    [syllabusId],
  );

  if (syllabusRes.rows.length === 0) throw new Error("Syllabus not found");
  const syllabus = syllabusRes.rows[0];

  // Get or create progress row for this user
  let progressRes = await pool.query(
    `SELECT * FROM ai_study_progress WHERE user_id = $1 AND syllabus_id = $2`,
    [userId, syllabusId],
  );

  if (progressRes.rows.length === 0) {
    await pool.query(
      `INSERT INTO ai_study_progress (user_id, syllabus_id) VALUES ($1, $2)`,
      [userId, syllabusId],
    );
    progressRes = await pool.query(
      `SELECT * FROM ai_study_progress WHERE user_id = $1 AND syllabus_id = $2`,
      [userId, syllabusId],
    );
  }

  const progress = progressRes.rows[0];

  return {
    syllabus,
    topics: syllabus.topics || [],
    coveredTopics: progress.covered_topics || [],
    weakTopics: progress.weak_topics || [],
    timetable: progress.timetable || {},
    progress,
  };
}

// ─── UPLOAD & PARSE SYLLABUS ─────────────────────────────────────────────────
exports.uploadSyllabus = async (req, res) => {
  const { subjectId } = req.body;

  if (!subjectId)
    return res.status(400).json({ error: "subjectId is required" });
  if (!req.file) return res.status(400).json({ error: "PDF file is required" });

  try {
    // 1. Get subject info first (needed for extraction and language check)
    const subjectRes = await pool.query(
      "SELECT name, code FROM subjects WHERE id = $1",
      [subjectId],
    );
    if (subjectRes.rows.length === 0)
      return res.status(404).json({ error: "Subject not found" });
    const subject = subjectRes.rows[0];

    // Block language/humanities subjects — no unit-based syllabus to parse
    if (isLanguageSubject(subject.name)) {
      return res.status(400).json({
        error: `"${subject.name}" is a language/humanities subject and is not supported by Ollie.`,
      });
    }

    // 2. Extract this subject's section from the PDF using pdfjs-dist (pure Node).
    //    path.resolve() ensures an absolute path regardless of where Node was started.
    const absolutePdfPath = path.resolve(req.file.path);
    const section = await extractSubjectSection(absolutePdfPath, subject.name);

    if (!section || section.trim().length < 100) {
      return res.status(400).json({
        error: `Could not find "${subject.name}" in this PDF. Check the subject name matches the syllabus exactly.`,
      });
    }

    const rawText = section; // store only the relevant section, not the whole PDF

    // 3. Ask Groq to parse topics (section is already scoped; 6000 char cap for safety)
    const truncatedText = section.slice(0, 6000);
    const systemPrompt = buildParsePrompt(subject.name);

    const raw = await chat(
      "smart",
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this syllabus:\n\n${truncatedText}` },
      ],
      600,
      true, // json mode
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res
        .status(500)
        .json({ error: "AI returned invalid JSON — try again" });
    }

    if (
      !parsed.topics ||
      !Array.isArray(parsed.topics) ||
      parsed.topics.length === 0
    ) {
      return res
        .status(500)
        .json({ error: "Could not extract topics from this PDF" });
    }

    // 4. Check if syllabus already exists for this subject — upsert
    const existing = await pool.query(
      "SELECT id FROM ai_syllabi WHERE subject_id = $1",
      [subjectId],
    );

    let syllabusId;
    if (existing.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE ai_syllabi SET raw_text = $1, topics = $2, file_path = $3, uploaded_by = $4
         WHERE subject_id = $5`,
        [
          rawText,
          JSON.stringify(parsed.topics),
          absolutePdfPath,
          req.user.userId,
          subjectId,
        ],
      );
      syllabusId = existing.rows[0].id;
    } else {
      const insert = await pool.query(
        `INSERT INTO ai_syllabi (subject_id, uploaded_by, file_path, raw_text, topics)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          subjectId,
          req.user.userId,
          absolutePdfPath,
          rawText,
          JSON.stringify(parsed.topics),
        ],
      );
      syllabusId = insert.rows[0].id;
    }

    res.json({
      syllabusId,
      topicCount: parsed.topics.length,
      topics: parsed.topics,
    });
  } catch (err) {
    console.error("uploadSyllabus:", err);
    res.status(500).json({ error: "Failed to process syllabus" });
  }
};

// ─── GET SYLLABUS FOR A SUBJECT ───────────────────────────────────────────────
exports.getSyllabus = async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT s.id, s.topics, s.created_at,
              sub.name AS subject_name, sub.code AS subject_code
       FROM ai_syllabi s
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE s.subject_id = $1`,
      [subjectId],
    );

    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }

    const syllabus = result.rows[0];

    // Get user progress if logged in
    const progressRes = await pool.query(
      `SELECT covered_topics, weak_topics, timetable, last_session_at
       FROM ai_study_progress
       WHERE user_id = $1 AND syllabus_id = $2`,
      [userId, syllabus.id],
    );

    const progress = progressRes.rows[0] || {
      covered_topics: [],
      weak_topics: [],
      timetable: {},
      last_session_at: null,
    };

    res.json({
      exists: true,
      syllabusId: syllabus.id,
      subjectName: syllabus.subject_name,
      subjectCode: syllabus.subject_code,
      topics: syllabus.topics,
      progress,
    });
  } catch (err) {
    console.error("getSyllabus:", err);
    res.status(500).json({ error: "Failed to fetch syllabus" });
  }
};

// ─── CHAT (explain / review modes) ───────────────────────────────────────────
exports.chat = async (req, res) => {
  const userId = req.user.userId;
  const { syllabusId, mode = "explain", topic, message, sessionId } = req.body;

  if (!syllabusId)
    return res.status(400).json({ error: "syllabusId is required" });
  if (!message) return res.status(400).json({ error: "message is required" });

  const validModes = ["explain", "review"];
  if (!validModes.includes(mode)) {
    return res
      .status(400)
      .json({ error: `mode must be one of: ${validModes.join(", ")}` });
  }

  try {
    const ctx = await getContext(userId, syllabusId);

    // Validate requested topic exists in syllabus
    if (topic) {
      const topicExists = ctx.topics.some((t) =>
        t.name.toLowerCase().includes(topic.toLowerCase()),
      );
      if (!topicExists) {
        return res.status(400).json({
          error: `Topic "${topic}" not found in this syllabus. Choose from the topic list.`,
        });
      }
    }

    // Get or create session
    let session;
    if (sessionId) {
      const sRes = await pool.query(
        "SELECT * FROM ai_sessions WHERE id = $1 AND user_id = $2",
        [sessionId, userId],
      );
      session = sRes.rows[0];
    }

    if (!session) {
      const sInsert = await pool.query(
        `INSERT INTO ai_sessions (user_id, syllabus_id, mode, messages)
         VALUES ($1, $2, $3, '[]') RETURNING *`,
        [userId, syllabusId, mode],
      );
      session = sInsert.rows[0];
    }

    // Build message history (cap at last 8 turns = 16 messages to save tokens)
    const history = (session.messages || []).slice(-16);
    const newUserMsg = { role: "user", content: message };
    const messages = [
      {
        role: "system",
        content: buildSystemPrompt({
          subject: {
            name: ctx.syllabus.subject_name,
            code: ctx.syllabus.subject_code,
          },
          topics: ctx.topics,
          coveredTopics: ctx.coveredTopics,
          weakTopics: ctx.weakTopics,
          mode,
        }),
      },
      ...history,
      newUserMsg,
    ];

    // Call Groq
    const aiResponse = await chat("smart", messages, 800);

    // Persist updated session messages
    const updatedMessages = [
      ...history,
      newUserMsg,
      { role: "assistant", content: aiResponse },
    ];
    await pool.query(
      `UPDATE ai_sessions SET messages = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(updatedMessages), session.id],
    );

    // Update last session time on progress
    await pool.query(
      `UPDATE ai_study_progress SET last_session_at = NOW()
       WHERE user_id = $1 AND syllabus_id = $2`,
      [userId, syllabusId],
    );

    res.json({
      response: aiResponse,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("chat:", err);
    res
      .status(500)
      .json({
        error: "Ollie is having trouble responding right now. Try again!",
      });
  }
};

// ─── GENERATE QUIZ ────────────────────────────────────────────────────────────
exports.generateQuiz = async (req, res) => {
  const userId = req.user.userId;
  const { syllabusId, topic, count = 5 } = req.body;

  if (!syllabusId || !topic) {
    return res.status(400).json({ error: "syllabusId and topic are required" });
  }

  const safeCount = Math.min(10, Math.max(3, parseInt(count, 10)));

  try {
    const ctx = await getContext(userId, syllabusId);

    // Validate topic
    const topicExists = ctx.topics.some((t) =>
      t.name.toLowerCase().includes(topic.toLowerCase()),
    );
    if (!topicExists) {
      return res
        .status(400)
        .json({ error: `Topic "${topic}" not found in syllabus` });
    }

    const systemPrompt = buildSystemPrompt({
      subject: {
        name: ctx.syllabus.subject_name,
        code: ctx.syllabus.subject_code,
      },
      topics: ctx.topics,
      coveredTopics: ctx.coveredTopics,
      weakTopics: ctx.weakTopics,
      mode: "quiz",
    });

    const raw = await chat(
      "fast",
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate ${safeCount} MCQ questions on: "${topic}"`,
        },
      ],
      600,
      true, // json mode
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res
        .status(500)
        .json({ error: "Quiz generation failed — please try again" });
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return res
        .status(500)
        .json({ error: "Quiz generation returned unexpected format" });
    }

    res.json({ topic, questions: parsed.questions });
  } catch (err) {
    console.error("generateQuiz:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
};

// ─── SUBMIT QUIZ RESULTS ──────────────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
  const userId = req.user.userId;
  const { syllabusId, topic, score, totalQuestions } = req.body;

  if (!syllabusId || !topic || score === undefined || !totalQuestions) {
    return res
      .status(400)
      .json({ error: "syllabusId, topic, score, totalQuestions required" });
  }

  const percentage = Math.round((score / totalQuestions) * 100);

  try {
    // Record attempt
    await pool.query(
      `INSERT INTO ai_quiz_attempts (user_id, syllabus_id, topic, score, total_q)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, syllabusId, topic, percentage, totalQuestions],
    );

    // Get current progress
    const progressRes = await pool.query(
      `SELECT covered_topics, weak_topics FROM ai_study_progress
       WHERE user_id = $1 AND syllabus_id = $2`,
      [userId, syllabusId],
    );

    if (progressRes.rows.length === 0) {
      return res.status(404).json({ error: "Progress record not found" });
    }

    let { covered_topics, weak_topics } = progressRes.rows[0];
    covered_topics = covered_topics || [];
    weak_topics = weak_topics || [];

    // Mark as covered if score >= 70%
    if (percentage >= 70 && !covered_topics.includes(topic)) {
      covered_topics = [...covered_topics, topic];
    }

    // Track as weak if score < 60%
    if (percentage < 60) {
      if (!weak_topics.includes(topic)) {
        weak_topics = [...weak_topics, topic];
      }
    } else {
      // Remove from weak if they passed this time
      weak_topics = weak_topics.filter((t) => t !== topic);
    }

    await pool.query(
      `UPDATE ai_study_progress
       SET covered_topics = $1, weak_topics = $2, last_session_at = NOW()
       WHERE user_id = $3 AND syllabus_id = $4`,
      [
        JSON.stringify(covered_topics),
        JSON.stringify(weak_topics),
        userId,
        syllabusId,
      ],
    );

    res.json({
      percentage,
      passed: percentage >= 70,
      topicCovered: percentage >= 70,
      isWeak: percentage < 60,
      coveredTopics: covered_topics,
      weakTopics: weak_topics,
      feedback:
        percentage >= 70
          ? `Great work! "${topic}" is marked as covered. 🦉`
          : percentage >= 50
            ? `Almost there! Review "${topic}" and try again when ready. 🦉`
            : `"${topic}" needs more attention. Let Ollie explain it again before retrying. 🦉`,
    });
  } catch (err) {
    console.error("submitQuiz:", err);
    res.status(500).json({ error: "Failed to save quiz results" });
  }
};

// ─── GENERATE TIMETABLE ───────────────────────────────────────────────────────
exports.generateTimetable = async (req, res) => {
  const userId = req.user.userId;
  const { syllabusId, examDate, hoursPerDay = 3 } = req.body;

  if (!syllabusId || !examDate) {
    return res
      .status(400)
      .json({ error: "syllabusId and examDate are required" });
  }

  try {
    const ctx = await getContext(userId, syllabusId);

    // Only plan uncovered topics (+ weak ones get extra day)
    const remainingTopics = ctx.topics.filter(
      (t) => !ctx.coveredTopics.includes(t.name),
    );
    const weakTopicsInRemaining = remainingTopics.filter((t) =>
      ctx.weakTopics.includes(t.name),
    );

    if (remainingTopics.length === 0) {
      return res.json({
        message:
          "🎉 You've covered all topics! Use remaining time for revision.",
        plan: [],
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const topicSummary = remainingTopics
      .map(
        (t) =>
          `${t.name} (Unit ${t.unit}, weight: ${t.weightage}/10${ctx.weakTopics.includes(t.name) ? ", WEAK - needs extra time" : ""})`,
      )
      .join("\n");

    const systemPrompt = buildSystemPrompt({
      subject: {
        name: ctx.syllabus.subject_name,
        code: ctx.syllabus.subject_code,
      },
      topics: ctx.topics,
      coveredTopics: ctx.coveredTopics,
      weakTopics: ctx.weakTopics,
      mode: "timetable",
    });

    const raw = await chat(
      "smart",
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create a study timetable from ${today} to ${examDate}.
Available study time: ${hoursPerDay} hours per day.
Topics to cover (prioritise by weight, give weak topics an extra day):
${topicSummary}`,
        },
      ],
      1000,
      true,
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res
        .status(500)
        .json({ error: "Timetable generation failed — please try again" });
    }

    // Save timetable to progress
    await pool.query(
      `UPDATE ai_study_progress SET timetable = $1 WHERE user_id = $2 AND syllabus_id = $3`,
      [JSON.stringify(parsed), userId, syllabusId],
    );

    res.json({ plan: parsed.plan || [], rawParsed: parsed });
  } catch (err) {
    console.error("generateTimetable:", err);
    res.status(500).json({ error: "Failed to generate timetable" });
  }
};

// ─── GET PROGRESS ─────────────────────────────────────────────────────────────
exports.getProgress = async (req, res) => {
  const userId = req.user.userId;
  const { syllabusId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, s.topics,
              sub.name AS subject_name, sub.code AS subject_code
       FROM ai_study_progress p
       JOIN ai_syllabi s ON p.syllabus_id = s.id
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE p.user_id = $1 AND p.syllabus_id = $2`,
      [userId, syllabusId],
    );

    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }

    const row = result.rows[0];
    const allTopics = row.topics || [];
    const covered = row.covered_topics || [];

    res.json({
      exists: true,
      subjectName: row.subject_name,
      subjectCode: row.subject_code,
      coveredTopics: covered,
      weakTopics: row.weak_topics || [],
      timetable: row.timetable || {},
      lastSessionAt: row.last_session_at,
      totalTopics: allTopics.length,
      completionPercent:
        allTopics.length > 0
          ? Math.round((covered.length / allTopics.length) * 100)
          : 0,
    });
  } catch (err) {
    console.error("getProgress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

// ─── MARK TOPIC COVERED (manual) ─────────────────────────────────────────────
exports.markTopicCovered = async (req, res) => {
  const userId = req.user.userId;
  const { syllabusId, topic } = req.body;

  if (!syllabusId || !topic) {
    return res.status(400).json({ error: "syllabusId and topic required" });
  }

  try {
    const progressRes = await pool.query(
      `SELECT covered_topics FROM ai_study_progress WHERE user_id = $1 AND syllabus_id = $2`,
      [userId, syllabusId],
    );

    if (progressRes.rows.length === 0) {
      return res.status(404).json({ error: "Progress not found" });
    }

    const covered = progressRes.rows[0].covered_topics || [];
    if (!covered.includes(topic)) {
      covered.push(topic);
      await pool.query(
        `UPDATE ai_study_progress SET covered_topics = $1 WHERE user_id = $2 AND syllabus_id = $3`,
        [JSON.stringify(covered), userId, syllabusId],
      );
    }

    res.json({ message: "Topic marked as covered", coveredTopics: covered });
  } catch (err) {
    console.error("markTopicCovered:", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
};