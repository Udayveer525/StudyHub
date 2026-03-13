const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/degrees/:degreeId/semesters
router.get("/degrees/:degreeId/semesters", async (req, res) => {
  const { degreeId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT s.id, s.number
      FROM semesters s
      WHERE s.degree_id = $1
      ORDER BY s.number
      `,
      [degreeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch semesters" });
  }
});


// GET /api/degrees/:degreeId/semesters/:semesterId/subjects
router.get(
  "/degrees/:degreeId/semesters/:semesterId/subjects",
  async (req, res) => {
    const { degreeId, semesterId } = req.params;

    try {
      const result = await pool.query(
        `
        SELECT sub.id, sub.code, sub.name
        FROM subjects sub
        JOIN semesters sem ON sub.semester_id = sem.id
        WHERE sem.id = $1
          AND sem.degree_id = $2
        ORDER BY sub.code
        `,
        [semesterId, degreeId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  }
);


// GET /api/degrees/:degreeId/semesters/:semesterId/subjects/:subjectId/resources
router.get(
  "/degrees/:degreeId/semesters/:semesterId/subjects/:subjectId/resources",
  async (req, res) => {
    const { degreeId, semesterId, subjectId } = req.params;
    const { type } = req.query;

    try {
      let query = `
        SELECT r.id, r.title, r.url, r.year, rt.name AS type
        FROM resources r
        JOIN resource_types rt ON r.resource_type = rt.id
        JOIN subjects sub ON r.subject_id = sub.id
        JOIN semesters sem ON sub.semester_id = sem.id
        WHERE sub.id = $1
          AND sem.id = $2
          AND sem.degree_id = $3
      `;

      const params = [subjectId, semesterId, degreeId];

      if (type) {
        query += " AND rt.name = $4";
        params.push(type.toUpperCase());
      }

      query += " ORDER BY r.year DESC NULLS LAST";

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  }
);


module.exports = router;
