const pool = require("../config/db");

async function seedInstitutions() {
  try {
    console.log("🌱 Seeding institutions...");

    const query = `
      INSERT INTO institutions (name, city, state, country, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (name) DO NOTHING
      RETURNING id;
    `;

    const values = [
      "Punjab University",
      "Chandigarh",
      "Chandigarh",
      "India",
    ];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      console.log(`✅ Punjab University inserted with id: ${result.rows[0].id}`);
    } else {
      console.log("ℹ️ Punjab University already exists (skipped)");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed institutions:", err);
    process.exit(1);
  }
}

seedInstitutions();
