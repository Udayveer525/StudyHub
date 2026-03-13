const fs = require("fs");
require("dotenv").config();
const path = require("path");
const { Client } = require("pg");

// ---------- CONFIG ----------
const DATA_FILE = path.join(__dirname, "extractedData.json");

console.log({
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

// ---------- MAIN ----------
(async function migrate() {
  await client.connect();
  console.log("✅ Connected to PostgreSQL");

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  const degreeMap = new Map();    // name -> id
  const semesterMap = new Map();  // degree|number -> id
  const subjectMap = new Map();   // degree|semester|code -> id
  const resourceTypeMap = new Map();

  try {
    await client.query("BEGIN");

    // ---------- RESOURCE TYPES ----------
    const rtRes = await client.query(
      "SELECT id, name FROM resource_types"
    );
    for (const row of rtRes.rows) {
      resourceTypeMap.set(row.name, row.id);
    }

    // ---------- DEGREES ----------
    for (const deg of data.degrees) {
      const res = await client.query(
        `INSERT INTO degrees (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING
         RETURNING id`,
        [deg.name]
      );

      let id;
      if (res.rows.length > 0) {
        id = res.rows[0].id;
      } else {
        const existing = await client.query(
          "SELECT id FROM degrees WHERE name = $1",
          [deg.name]
        );
        id = existing.rows[0].id;
      }

      degreeMap.set(deg.name, id);
    }

    // ---------- SEMESTERS ----------
    for (const sem of data.semesters) {
      const degreeId = degreeMap.get(sem.degree);
      const key = `${sem.degree}|${sem.number}`;

      const res = await client.query(
        `INSERT INTO semesters (degree_id, number)
         VALUES ($1, $2)
         ON CONFLICT (degree_id, number) DO NOTHING
         RETURNING id`,
        [degreeId, sem.number]
      );

      let id;
      if (res.rows.length > 0) {
        id = res.rows[0].id;
      } else {
        const existing = await client.query(
          `SELECT id FROM semesters
           WHERE degree_id = $1 AND number = $2`,
          [degreeId, sem.number]
        );
        id = existing.rows[0].id;
      }

      semesterMap.set(key, id);
    }

    // ---------- SUBJECTS ----------
    for (const sub of data.subjects) {
      const semesterId = semesterMap.get(
        `${sub.degree}|${sub.semester}`
      );

      const key = `${sub.degree}|${sub.semester}|${sub.code}`;

      const res = await client.query(
        `INSERT INTO subjects (semester_id, code, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (semester_id, code) DO NOTHING
         RETURNING id`,
        [semesterId, sub.code, sub.name]
      );

      let id;
      if (res.rows.length > 0) {
        id = res.rows[0].id;
      } else {
        const existing = await client.query(
          `SELECT id FROM subjects
           WHERE semester_id = $1 AND code = $2`,
          [semesterId, sub.code]
        );
        id = existing.rows[0].id;
      }

      subjectMap.set(key, id);
    }

    // ---------- RESOURCES ----------
    for (const resrc of data.resources) {
      const subjectId = subjectMap.get(
        `${resrc.degree}|${resrc.semester}|${resrc.subject}`
      );

      if (!subjectId) continue;

      const typeId = resourceTypeMap.get(resrc.type);

      await client.query(
        `INSERT INTO resources
         (subject_id, resource_type, title, url, year, difficulty)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          subjectId,
          typeId,
          resrc.title,
          resrc.url,
          resrc.year,
          resrc.difficulty,
        ]
      );
    }

    await client.query("COMMIT");
    console.log("🎉 Migration completed successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
})();
