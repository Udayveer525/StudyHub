const pool = require("../config/db");

exports.getSemestersByDegree = async (req, res) => {
  const { degreeId } = req.query;

  if (!degreeId) {
    return res.status(400).json({
      error: "degreeId query parameter is required",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, number
      FROM semesters
      WHERE degree_id = $1
      ORDER BY number
      `,
      [degreeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch semesters",
    });
  }
};
