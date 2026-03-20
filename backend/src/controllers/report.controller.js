// controllers/report.controller.js
const pool = require("../config/db");

const VALID_TYPES = ["question", "answer", "resource"];
const VALID_REASONS = [
  "Incorrect information",
  "Spam or irrelevant",
  "Offensive content",
  "Copyright violation",
  "Other",
];

exports.submitReport = async (req, res) => {
  const reporterId = req.user.userId;
  const { target_type, target_id, reason } = req.body;

  // Validate target_type
  if (!target_type || !VALID_TYPES.includes(target_type)) {
    return res.status(400).json({
      error: `target_type must be one of: ${VALID_TYPES.join(", ")}`,
    });
  }

  // Validate target_id
  if (!target_id || isNaN(parseInt(target_id, 10))) {
    return res.status(400).json({ error: "Valid target_id is required" });
  }

  // Validate reason
  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({ error: "A reason is required" });
  }

  try {
    // Verify the target content actually exists
    let existsQuery;
    if (target_type === "question") {
      existsQuery = "SELECT id FROM questions WHERE id = $1";
    } else if (target_type === "answer") {
      existsQuery = "SELECT id FROM answers WHERE id = $1";
    } else {
      existsQuery = "SELECT id FROM resources WHERE id = $1";
    }

    const exists = await pool.query(existsQuery, [target_id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: `${target_type} not found` });
    }

    // Prevent duplicate reports from same user on same content
    const duplicate = await pool.query(
      `SELECT id FROM reports
       WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'pending'`,
      [reporterId, target_type, target_id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        error: "You have already reported this content",
      });
    }

    await pool.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [reporterId, target_type, parseInt(target_id, 10), reason.trim()]
    );

    res.status(201).json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("submitReport:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
};