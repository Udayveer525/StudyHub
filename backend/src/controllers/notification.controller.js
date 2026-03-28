// controllers/notification.controller.js
const pool = require("../config/db");

// Returns unread activity since a given timestamp (last_checked)
// "Unread" = new answers on your questions, or your answers got accepted
exports.getNotifications = async (req, res) => {
  const userId = req.user.userId;
  // last_checked comes as a query param (ISO string), defaults to 24h ago
  const since = req.query.since
    ? new Date(req.query.since)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    // New answers on questions you asked
    const newAnswers = await pool.query(
      `SELECT
         a.id AS answer_id,
         a.created_at,
         q.id AS question_id,
         q.title AS question_title,
         u.name AS answerer_name,
         'new_answer' AS type
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       JOIN users u ON a.user_id = u.id
       WHERE q.user_id = $1
         AND a.user_id != $1
         AND a.created_at > $2
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [userId, since]
    );

    // Your answers that were accepted
    const acceptedAnswers = await pool.query(
      `SELECT
         a.id AS answer_id,
         a.created_at,
         q.id AS question_id,
         q.title AS question_title,
         'answer_accepted' AS type
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.user_id = $1
         AND a.is_accepted = true
         AND a.created_at > $2
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [userId, since]
    );

    const notifications = [
      ...newAnswers.rows,
      ...acceptedAnswers.rows,
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ notifications, count: notifications.length });
  } catch (err) {
    console.error("getNotifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};