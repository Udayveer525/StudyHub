const pool = require("../config/db");
const TITLE_LEVELS = require("../utils/titleLevels");

async function updateUserTitle(userId) {
  // Count accepted answers
  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM answers
    WHERE user_id = $1 AND is_accepted = true
    `,
    [userId]
  );

  const acceptedCount = result.rows[0].count;

  // Determine highest eligible level
  let eligible = null;

  for (const level of TITLE_LEVELS) {
    if (acceptedCount >= level.threshold) {
      eligible = level;
    }
  }

  if (!eligible) return; // No promotion

  // Get current level
  const userRes = await pool.query(
    `SELECT current_level FROM users WHERE id = $1`,
    [userId]
  );

  const currentLevel = userRes.rows[0].current_level;

  if (eligible.level <= currentLevel) {
    return; // No upgrade needed
  }

  // Insert achievement
  await pool.query(
    `
    INSERT INTO achievements (user_id, title, level)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, level) DO NOTHING
    `,
    [userId, eligible.title, eligible.level]
  );

  // Update user's current title
  await pool.query(
    `
    UPDATE users
    SET current_title = $1,
        current_level = $2
    WHERE id = $3
    `,
    [eligible.title, eligible.level, userId]
  );

  console.log(`User ${userId} promoted to ${eligible.title}`);
}

module.exports = { updateUserTitle };
