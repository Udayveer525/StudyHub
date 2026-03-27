// controllers/profile.controller.js
const pool = require("../config/db");

// ─── GET public profile ───────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Core user info + title
    const userRes = await pool.query(
      `SELECT u.id, u.name, u.created_at, u.current_title, u.current_level,
              up.bio, up.phone, up.institution_id, up.degree_id, up.semester_id,
              i.name AS institution_name,
              d.name AS degree_name,
              sem.number AS semester_number
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN institutions i ON i.id = up.institution_id
       LEFT JOIN degrees d ON d.id = up.degree_id
       LEFT JOIN semesters sem ON sem.id = up.semester_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.rows[0];

    // Achievements
    const achievementsRes = await pool.query(
      `SELECT title, level, earned_at FROM achievements
       WHERE user_id = $1 ORDER BY level ASC`,
      [userId]
    );

    // Questions (paginated)
    const page   = Math.max(1, parseInt(req.query.page  || "1", 10));
    const limit  = Math.min(10, parseInt(req.query.limit || "10", 10));
    const offset = (page - 1) * limit;

    const questionsRes = await pool.query(
      `SELECT q.id, q.title, q.status, q.created_at,
              s.name AS subject_name, s.code AS subject_code,
              (SELECT COUNT(*)::int FROM answers a WHERE a.question_id = q.id) AS answer_count
       FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       WHERE q.user_id = $1
       ORDER BY q.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM questions WHERE user_id = $1`,
      [userId]
    );

    // Stats
    const statsRes = await pool.query(
      `SELECT
        (SELECT COUNT(*)::int FROM questions WHERE user_id = $1)   AS questions_asked,
        (SELECT COUNT(*)::int FROM answers   WHERE user_id = $1)   AS answers_given,
        (SELECT COUNT(*)::int FROM answers   WHERE user_id = $1 AND is_accepted = true) AS answers_accepted,
        (SELECT COUNT(*)::int FROM saved_resources WHERE user_id = $1) AS resources_saved`,
      [userId]
    );

    res.json({
      user,
      stats: statsRes.rows[0],
      achievements: achievementsRes.rows,
      questions: {
        items: questionsRes.rows,
        total: countRes.rows[0].total,
        page,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("getProfile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ─── PUT update own profile ───────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;

  // Only the owner can update their own profile
  if (parseInt(userId, 10) !== req.user.userId) {
    return res.status(403).json({ error: "You can only edit your own profile" });
  }

  const { bio, phone, institution_id, degree_id, semester_id } = req.body;

  // Validate phone — optional but if provided must be a 10-digit Indian number
  if (phone && phone.trim() !== "") {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      return res.status(400).json({ error: "Phone must be a 10-digit Indian mobile number (without +91)" });
    }
  }

  try {
    // Upsert — create profile row if it doesn't exist yet
    await pool.query(
      `INSERT INTO user_profiles (user_id, bio, phone, institution_id, degree_id, semester_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         bio            = EXCLUDED.bio,
         phone          = EXCLUDED.phone,
         institution_id = EXCLUDED.institution_id,
         degree_id      = EXCLUDED.degree_id,
         semester_id    = EXCLUDED.semester_id,
         updated_at     = NOW()`,
      [
        userId,
        bio?.trim()          || null,
        phone?.replace(/\D/g, "") || null,
        institution_id       || null,
        degree_id            || null,
        semester_id          || null,
      ]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateProfile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};