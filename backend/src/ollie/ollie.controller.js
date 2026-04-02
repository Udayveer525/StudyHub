// ollie/ollie.controller.js
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chat } = require("./groq.client");
const { buildSystemPrompt, buildParsePrompt } = require("./prompt.builder");

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

// ─── PDF extraction via pdfplumber (Python) ───────────────────────────────────
// We use pdfplumber instead of pdf-parse because pdf-parse silently truncates
// large PDFs to ~10 KB of text — enough for semester 1 only.  pdfplumber
// works page-by-page so we get the full 55-page document every time.
//
// EXTRACTION STRATEGY — no subject code required:
//
//   Every subject content page in the BCA syllabus has this structure:
//     Line 1:  Subject name          (e.g. "Java Programming")
//     Line 2:  BCA paper code        (e.g. "BCA-16-503")
//     Line 3:  "L T P Cr External Marks: 65"   ← the unique marker
//     ...      Objective, Note, UNIT I … UNIT IV
//     End:     "Suggested Readings" / "References:"
//
//   Scheme tables also contain "Subject name → BCA code" pairs, but they are
//   immediately followed by a numeric row ("6 - - 6 10 65 75 3 Hrs 3"), never
//   by "External Marks".  This makes "External Marks" the 100% reliable signal
//   that we are on a real content page, not a table entry.
//
//   The Python script below uses pdfplumber to read the PDF page-by-page,
//   identifies content pages by the "External Marks" signal, stitches together
//   multi-page subjects (common — many subjects span 2 pages), and returns the
//   text for the one subject whose name matches the request.

const EXTRACT_SCRIPT = path.join(__dirname, "extract_pdf.py");

// On Windows, the Python executable is "python", not "python3".
// On Linux/macOS (and Render), it is "python3".
// We detect once at startup so every call uses the right command.
const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";

/**
 * Extract the full syllabus text for one subject from a PDF file.
 * Returns the raw text string, or null if the subject was not found.
 *
 * @param {string} pdfPath      - Absolute path to the uploaded PDF
 * @param {string} subjectName  - e.g. "Java Programming"
 */
function extractSubjectSection(pdfPath, subjectName) {
  try {
    const result = execFileSync(
      PYTHON_CMD,
      [EXTRACT_SCRIPT, pdfPath, subjectName],
      { encoding: "utf-8", timeout: 30_000 },
    );
    const parsed = JSON.parse(result.trim());
    if (!parsed.success) {
      console.warn(`[Ollie] extract_pdf.py: subject not found — "${subjectName}"`);
      return null;
    }
    console.log(
      `[Ollie] Extracted "${subjectName}": ${parsed.text.length} chars`,
    );
    return parsed.text;
  } catch (err) {
    // err.stderr contains the Python traceback — log it for easier debugging
    console.error("[Ollie] extractSubjectSection error:", err.message);
    if (err.stderr) console.error("[Ollie] Python stderr:", err.stderr.slice(0, 500));
    return null;
  }
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
    // 1. Get subject info first (needed for extraction)
    const subjectRes = await pool.query(
      "SELECT name, code FROM subjects WHERE id = $1",
      [subjectId],
    );
    if (subjectRes.rows.length === 0)
      return res.status(404).json({ error: "Subject not found" });
    const subject = subjectRes.rows[0];

    // Block language/humanities subjects — they have no unit-based syllabus
    // that Ollie can meaningfully parse (literature, poems, history essays).
    if (isLanguageSubject(subject.name)) {
      return res.status(400).json({
        error: `"${subject.name}" is a language/humanities subject and is not supported by Ollie. Only technical subjects with unit-based syllabi can be uploaded.`,
      });
    }

    // 2. Extract this subject's section from the PDF via pdfplumber.
    //    path.resolve() converts multer's relative path to absolute — required
    //    because execFileSync's cwd may differ from the project root, which
    //    breaks relative paths on Windows and some Render configurations.
    const absolutePdfPath = path.resolve(req.file.path);
    const section = extractSubjectSection(absolutePdfPath, subject.name);
    if (!section || section.trim().length < 100) {
      return res.status(400).json({
        error: `Could not find "${subject.name}" in this PDF. Check the subject name matches the syllabus exactly.`,
      });
    }

    // Store the extracted section text (not the whole PDF) — saves DB space
    // and means raw_text is always the relevant content for this subject.
    const rawText = section;

    // 3. Ask Groq to parse topics (section is already scoped, 6000 char cap as safety)
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