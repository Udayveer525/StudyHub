const pool = require("../config/db");

exports.getInstitutions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name FROM institutions ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getInstitutions:", err);
    res.status(500).json({ error: "Failed to fetch institutions" });
  }
};
