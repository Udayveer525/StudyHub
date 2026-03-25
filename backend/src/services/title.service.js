// services/title.service.js
const pool = require("../config/db");
const TITLE_LEVELS = require("../utils/titleLevels");
const { sendPromotionEmail } = require("./email.service");

// client param is optional — pass it when calling inside an existing transaction
async function updateUserTitle(userId, client) {
  const db = client || pool;

  const result = await db.query(
    `SELECT COUNT(*)::int AS count FROM answers WHERE user_id = $1 AND is_accepted = true`,
    [userId]
  );

  const acceptedCount = result.rows[0].count;

  let eligible = null;
  for (const level of TITLE_LEVELS) {
    if (acceptedCount >= level.threshold) eligible = level;
  }

  if (!eligible) return;

  const userRes = await db.query(
    `SELECT current_level, name, email FROM users WHERE id = $1`,
    [userId]
  );

  const { current_level: currentLevel, name, email } = userRes.rows[0];

  if (eligible.level <= currentLevel) return;

  await db.query(
    `INSERT INTO achievements (user_id, title, level)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, level) DO NOTHING`,
    [userId, eligible.title, eligible.level]
  );

  await db.query(
    `UPDATE users SET current_title = $1, current_level = $2 WHERE id = $3`,
    [eligible.title, eligible.level, userId]
  );

  console.log(`User ${userId} promoted to ${eligible.title}`);

  // Send promotion email — fire and forget
  sendPromotionEmail(email, name, eligible.title, eligible.level).catch((err) =>
    console.error("Failed to send promotion email:", err)
  );
}

module.exports = { updateUserTitle };