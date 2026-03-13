const pool = require("../config/db");

// Helper: basic sanitization/validation
function validateQuestionInput(title, subjectId) {
  if (!title || typeof title !== "string" || title.trim().length < 10) {
    return "Title is required and should be at least 10 characters.";
  }
  if (!subjectId || isNaN(parseInt(subjectId, 10))) {
    return "Valid subjectId is required.";
  }
  return null;
}

exports.createQuestion = async (req, res) => {
  const { name: authorName } = req.user || {}; // optional info
  const { title, description, subjectId } = req.body;
  const userId = req.user.userId;

  const errMsg = validateQuestionInput(title, subjectId);
  if (errMsg) return res.status(400).json({ error: errMsg });

  try {
    // check subject exists
    const subjectRes = await pool.query(
      "SELECT id FROM subjects WHERE id = $1",
      [subjectId],
    );
    if (subjectRes.rows.length === 0) {
      return res.status(400).json({ error: "Subject not found" });
    }

    const insert = await pool.query(
      `INSERT INTO questions (user_id, subject_id, title, description, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING id, created_at`,
      [userId, subjectId, title.trim(), description || null],
    );

    return res.status(201).json({
      id: insert.rows[0].id,
      created_at: insert.rows[0].created_at,
    });
  } catch (err) {
    console.error("createQuestion:", err);
    return res.status(500).json({ error: "Failed to create question" });
  }
};

exports.listQuestions = async (req, res) => {
  // Filters: degreeId, semesterId, subjectId, status, search, limit, offset
  const {
    degreeId,
    semesterId,
    subjectId,
    status,
    search,
    limit = 20,
    offset = 0,
  } = req.query;

  let idx = 1;
  const params = [];
  let where = " WHERE 1=1 ";

  if (subjectId) {
    where += ` AND q.subject_id = $${idx++} `;
    params.push(subjectId);
  } else {
    if (semesterId) {
      where += ` AND sem.id = $${idx++} `;
      params.push(semesterId);
    }
    if (degreeId) {
      where += ` AND sem.degree_id = $${idx++} `;
      params.push(degreeId);
    }
  }

  if (status) {
    where += ` AND q.status = $${idx++} `;
    params.push(status);
  }

  if (search) {
    where += ` AND (q.title ILIKE $${idx} OR q.description ILIKE $${idx}) `;
    params.push(`%${search}%`);
    idx++;
  }

  const limitIdx = idx++;
  const offsetIdx = idx++;

  params.push(Number(limit), Number(offset));

  const sql = `
    SELECT
      q.id,
      q.title,
      q.description,
      q.status,
      q.created_at,
      q.user_id,
      u.name AS author_name,
      s.id AS subject_id,
      s.code AS subject_code,
      s.name AS subject_name,
      sem.id AS semester_id,
      sem.number AS semester_number,
      d.id AS degree_id,
      d.name AS degree_name,
      (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answer_count,
      COALESCE((SELECT SUM(v.value) FROM votes v JOIN answers a2 ON a2.id = v.answer_id WHERE a2.question_id = q.id),0) AS vote_score
    FROM questions q
    JOIN users u ON q.user_id = u.id
    JOIN subjects s ON q.subject_id = s.id
    JOIN semesters sem ON s.semester_id = sem.id
    JOIN degrees d ON sem.degree_id = d.id
    ${where}
    ORDER BY q.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  try {
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("listQuestions:", err);
    return res.status(500).json({ error: "Failed to list questions" });
  }
};

exports.getQuestionById = async (req, res) => {
  const qid = req.params.id;

  try {
    const qRes = await pool.query(
      `
      SELECT q.id, q.title, q.description, q.status, q.created_at, q.user_id,
             u.name AS author_name, s.id AS subject_id, s.code AS subject_code, s.name AS subject_name,
             sem.id AS semester_id, sem.number AS semester_number, d.id AS degree_id, d.name AS degree_name
      FROM questions q
      JOIN users u ON q.user_id = u.id
      JOIN subjects s ON q.subject_id = s.id
      JOIN semesters sem ON s.semester_id = sem.id
      JOIN degrees d ON sem.degree_id = d.id
      WHERE q.id = $1
      `,
      [qid],
    );

    if (qRes.rows.length === 0)
      return res.status(404).json({ error: "Question not found" });

    const question = qRes.rows[0];

    // fetch answers with score & author
    const answersRes = await pool.query(
      `
      SELECT a.id, a.content, a.is_accepted, a.created_at, a.user_id, u.name AS author_name,
             COALESCE(SUM(v.value),0) AS vote_score
      FROM answers a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN votes v ON v.answer_id = a.id
      WHERE a.question_id = $1
      GROUP BY a.id, u.name
      ORDER BY a.is_accepted DESC, COALESCE(SUM(v.value),0) DESC, a.created_at ASC
      `,
      [qid],
    );

    question.answers = answersRes.rows;
    return res.json(question);
  } catch (err) {
    console.error("getQuestionById:", err);
    return res.status(500).json({ error: "Failed to fetch question" });
  }
};

exports.addAnswer = async (req, res) => {
  const qid = req.params.id;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim().length < 5) {
    return res.status(400).json({ error: "Answer content too short" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // verify question exists
    const qRes = await client.query(
      "SELECT id FROM questions WHERE id = $1 FOR UPDATE",
      [qid],
    );
    if (qRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Question not found" });
    }
    if (qRes.status === "resolved") {
      return res.status(400).json({ error: "Question is resolved" });
    }

    const insert = await client.query(
      `INSERT INTO answers (question_id, user_id, content, is_accepted)
       VALUES ($1, $2, $3, false)
       RETURNING id, created_at`,
      [qid, userId, content.trim()],
    );

    // If question status is still 'open', set to 'answered'
    await client.query(
      `UPDATE questions SET status = 'answered' WHERE id = $1 AND status = 'open'`,
      [qid],
    );

    await client.query("COMMIT");
    return res
      .status(201)
      .json({ id: insert.rows[0].id, created_at: insert.rows[0].created_at });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("addAnswer:", err);
    return res.status(500).json({ error: "Failed to add answer" });
  } finally {
    client.release();
  }
};

exports.getAnswersByQuestion = async (req, res) => {
  const qid = req.params.id;
  try {
    const answersRes = await pool.query(
      `
      SELECT 
        a.id, a.content, a.is_accepted, a.created_at, a.user_id, u.name AS author_name, u.current_title,
        COALESCE(SUM(v.value),0) AS vote_score
      FROM answers a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN votes v ON v.answer_id = a.id
      WHERE a.question_id = $1
      GROUP BY
        a.id,
        a.content,
        a.is_accepted,
        a.created_at,
        a.user_id,
        u.name,
        u.current_title
      ORDER BY 
        a.is_accepted DESC,
        vote_score DESC,
        a.created_at ASC
      `,
      [qid],
    );

    return res.json(answersRes.rows);
  } catch (err) {
    console.error("getAnswersByQuestion:", err);
    return res.status(500).json({ error: "Failed to fetch answers" });
  }
};
