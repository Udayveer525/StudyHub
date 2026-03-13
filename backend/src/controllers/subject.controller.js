const pool = require("../config/db");

exports.getSubjectsBySemester = async (req, res) => {
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({
      error: "semesterId query parameter is required",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, code, name
      FROM subjects
      WHERE semester_id = $1
      ORDER BY code
      `,
      [semesterId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch subjects",
    });
  }
};
