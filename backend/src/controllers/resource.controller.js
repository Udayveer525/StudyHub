const pool = require("../config/db");

exports.getResourcesBySubject = async (req, res) => {
  const { subjectId, type } = req.query;
  // Grab the user ID if the user is logged in (depends on your auth middleware)
  const userId = req.user?.userId || null; 

  if (!subjectId) {
    return res.status(400).json({
      error: "subjectId query parameter is required",
    });
  }

  try {
    let query = `
      SELECT 
        r.id, 
        r.title, 
        r.url, 
        r.year, 
        rt.name AS type,
        EXISTS (
          SELECT 1 FROM saved_resources sr 
          WHERE sr.resource_id = r.id AND sr.user_id = $2
        ) AS is_saved
      FROM resources r
      JOIN resource_types rt ON r.resource_type = rt.id
      WHERE r.subject_id = $1
    `;
    
    // $1 is subjectId, $2 is userId
    const params = [subjectId, userId];
    let paramIndex = 3;

    if (type) {
      query += ` AND rt.name = $${paramIndex}`;
      params.push(type.toUpperCase());
      paramIndex++;
    }

    query += " ORDER BY r.year DESC NULLS LAST";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch resources",
    });
  }
};

exports.searchResources = async (req, res) => {
  const { q } = req.query;
  const userId = req.user?.id || null;

  if (!q) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.title,
        r.url,
        rt.name AS type,
        s.name AS subject_name,
        r.created_at,
        EXISTS (
          SELECT 1 FROM saved_resources sr 
          WHERE sr.resource_id = r.id AND sr.user_id = $2
        ) AS is_saved
      FROM resources r
      JOIN resource_types rt ON r.resource_type = rt.id
      JOIN subjects s ON r.subject_id = s.id
      WHERE r.title ILIKE $1
      ORDER BY r.created_at DESC
      LIMIT 20
      `,
      [`%${q}%`, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("searchResources:", err);
    res.status(500).json({ error: "Failed to search resources" });
  }
};

exports.getRecentResources = async (req, res) => {
  const userId = req.user?.id || null;

  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.title,
        r.url,
        rt.name AS type,
        s.name AS subject_name,
        r.created_at,
        EXISTS (
          SELECT 1 FROM saved_resources sr 
          WHERE sr.resource_id = r.id AND sr.user_id = $1
        ) AS is_saved
      FROM resources r
      JOIN resource_types rt ON r.resource_type = rt.id
      JOIN subjects s ON r.subject_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 10
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getRecentResources:", err);
    res.status(500).json({ error: "Failed to fetch recent resources" });
  }
};