const pool = require("../config/db");

exports.toggleSaveResource = async (req, res) => {
  const userId = req.user.userId;
  const resourceId = req.params.id;

  try {
    const existing = await pool.query(
      `
      SELECT 1 FROM saved_resources
      WHERE user_id = $1 AND resource_id = $2
      `,
      [userId, resourceId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `
        DELETE FROM saved_resources
        WHERE user_id = $1 AND resource_id = $2
        `,
        [userId, resourceId]
      );
      return res.json({ saved: false });
    }

    await pool.query(
      `
      INSERT INTO saved_resources (user_id, resource_id, saved_at)
      VALUES ($1, $2, NOW())
      `,
      [userId, resourceId]
    );

    res.json({ saved: true });
  } catch (err) {
    console.error("toggleSaveResource:", err);
    res.status(500).json({ error: "Failed to save resource" });
  }
};

exports.getSavedResources = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.title,
        r.url,
        rt.name AS type,
        s.name AS subject_name,
        sr.saved_at
      FROM saved_resources sr
      JOIN resources r ON sr.resource_id = r.id
      JOIN resource_types rt ON r.resource_type = rt.id
      JOIN subjects s ON r.subject_id = s.id
      WHERE sr.user_id = $1
      ORDER BY sr.saved_at DESC
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json([]);
    }
    return res.json(result.rows);
  } catch (err) {
    console.error("getSavedResources:", err);
    res.status(500).json({ error: "Failed to fetch saved resources" });
  }
};


exports.getUserStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT
        (SELECT COUNT(*)::int FROM questions  WHERE user_id = $1) AS questions_asked,
        (SELECT COUNT(*)::int FROM answers    WHERE user_id = $1) AS answers_given,
        (SELECT COUNT(*)::int FROM answers    WHERE user_id = $1 AND is_accepted = true) AS answers_accepted,
        (SELECT COUNT(*)::int FROM saved_resources WHERE user_id = $1) AS resources_saved`,
      [userId]
    );

    // Recent questions (last 5) — used by dashboard
    const questionsRes = await pool.query(
      `SELECT q.id, q.title, q.status, q.created_at,
              (SELECT COUNT(*)::int FROM answers a WHERE a.question_id = q.id) AS answer_count
       FROM questions q
       WHERE q.user_id = $1
       ORDER BY q.created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      ...result.rows[0],
      recent_questions: questionsRes.rows,
    });
  } catch (err) {
    console.error("getUserStats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};