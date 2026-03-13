const pool = require("../config/db");

exports.getAllDegrees = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM degrees ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch degrees" });
  }
};