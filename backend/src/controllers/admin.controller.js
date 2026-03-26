// controllers/admin.controller.js
const pool = require("../config/db");

// ─── STATS ────────────────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const [
      usersRes,
      questionsRes,
      answersRes,
      resourcesRes,
      pendingReportsRes,
      pendingSubmissionsRes,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COUNT(*)::int AS count FROM questions"),
      pool.query("SELECT COUNT(*)::int AS count FROM answers"),
      pool.query("SELECT COUNT(*)::int AS count FROM resources"),
      pool.query(
        "SELECT COUNT(*)::int AS count FROM reports WHERE status = 'pending'",
      ),
      pool.query(
        "SELECT COUNT(*)::int AS count FROM contact_submissions WHERE status = 'pending'",
      ),
    ]);

    res.json({
      totalUsers: usersRes.rows[0].count,
      totalQuestions: questionsRes.rows[0].count,
      totalAnswers: answersRes.rows[0].count,
      totalResources: resourcesRes.rows[0].count,
      pendingReports: pendingReportsRes.rows[0].count,
      pendingSubmissions: pendingSubmissionsRes.rows[0].count,
    });
  } catch (err) {
    console.error("admin.getStats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────

exports.listReports = async (req, res) => {
  const { status = "pending", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const validStatuses = ["pending", "resolved", "dismissed", "all"];
  const safeStatus = validStatuses.includes(status) ? status : "pending";

  try {
    let whereClause =
      safeStatus !== "all" ? `WHERE r.status = '${safeStatus}'` : "";

    const reportsRes = await pool.query(
      `SELECT
        r.id,
        r.target_type,
        r.target_id,
        r.reason,
        r.status,
        r.created_at,
        u.name AS reporter_name,
        u.email AS reporter_email
       FROM reports r
       LEFT JOIN users u ON r.reporter_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit, 10), offset],
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM reports r ${whereClause}`,
    );

    // For each report, fetch a preview of the reported content
    const reports = await Promise.all(
      reportsRes.rows.map(async (report) => {
        let contentPreview = null;
        try {
          if (report.target_type === "question") {
            const q = await pool.query(
              `SELECT q.id, q.title, q.description, q.status, u.name AS author_name
               FROM questions q
               JOIN users u ON q.user_id = u.id
               WHERE q.id = $1`,
              [report.target_id],
            );
            contentPreview = q.rows[0] || null;
          } else if (report.target_type === "answer") {
            const a = await pool.query(
              `SELECT a.id, a.content, a.question_id, u.name AS author_name
               FROM answers a
               JOIN users u ON a.user_id = u.id
               WHERE a.id = $1`,
              [report.target_id],
            );
            contentPreview = a.rows[0] || null;
          } else if (report.target_type === "resource") {
            const r = await pool.query(
              `SELECT r.id, r.title, r.url, rt.name AS type, s.name AS subject_name
               FROM resources r
               JOIN resource_types rt ON r.resource_type = rt.id
               JOIN subjects s ON r.subject_id = s.id
               WHERE r.id = $1`,
              [report.target_id],
            );
            contentPreview = r.rows[0] || null;
          }
        } catch (e) {
          // Content may have already been deleted
          contentPreview = null;
        }

        return { ...report, contentPreview };
      }),
    );

    res.json({
      reports,
      total: countRes.rows[0].total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(countRes.rows[0].total / parseInt(limit, 10)),
    });
  } catch (err) {
    console.error("admin.listReports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.resolveReport = async (req, res) => {
  const reportId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch the report
    const reportRes = await client.query(
      "SELECT * FROM reports WHERE id = $1 FOR UPDATE",
      [reportId],
    );

    if (reportRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Report not found" });
    }

    const report = reportRes.rows[0];

    if (report.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Report is already actioned" });
    }

    // Delete the reported content
    if (report.target_type === "question") {
      await client.query("DELETE FROM questions WHERE id = $1", [
        report.target_id,
      ]);
    } else if (report.target_type === "answer") {
      await client.query("DELETE FROM answers WHERE id = $1", [
        report.target_id,
      ]);
    } else if (report.target_type === "resource") {
      await client.query("DELETE FROM resources WHERE id = $1", [
        report.target_id,
      ]);
    }

    // Mark all reports for this content as resolved (others may have reported same thing)
    await client.query(
      `UPDATE reports SET status = 'resolved'
       WHERE target_type = $1 AND target_id = $2`,
      [report.target_type, report.target_id],
    );

    await client.query("COMMIT");
    res.json({ message: "Content removed and report resolved" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("admin.resolveReport:", err);
    res.status(500).json({ error: "Failed to resolve report" });
  } finally {
    client.release();
  }
};

exports.dismissReport = async (req, res) => {
  const reportId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE reports SET status = 'dismissed'
       WHERE id = $1 AND status = 'pending'
       RETURNING id`,
      [reportId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Report not found or already actioned" });
    }

    res.json({ message: "Report dismissed" });
  } catch (err) {
    console.error("admin.dismissReport:", err);
    res.status(500).json({ error: "Failed to dismiss report" });
  }
};

// ─── CONTACT SUBMISSIONS ──────────────────────────────────────────────────────

exports.listSubmissions = async (req, res) => {
  const { status = "pending", page = 1, limit = 15, category = "" } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const validStatuses = ["pending", "reviewed", "dismissed", "all"];
  const safeStatus = validStatuses.includes(status) ? status : "pending";

  try {
    const params = [];
    const conditions = [];
    let idx = 1;

    if (safeStatus !== "all") {
      conditions.push(`cs.status = $${idx++}`);
      params.push(safeStatus);
    }

    if (category && category !== "all") {
      conditions.push(`cs.category = $${idx++}`);
      params.push(category);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const dataParams = [...params, parseInt(limit, 10), offset];
    const submissionsRes = await pool.query(
      `SELECT
        cs.id,
        cs.name,
        cs.email,
        cs.category,
        cs.message,
        cs.attachment_path,
        cs.status,
        cs.created_at,
        cs.reviewed_at,
        cs.admin_notes,
        cs.subject_id,
        cs.resource_type,
        cs.resource_url,
        cs.resource_year,
        u.name AS user_name,
        s.name AS subject_name
       FROM contact_submissions cs
       LEFT JOIN users u ON cs.user_id = u.id
       LEFT JOIN subjects s ON cs.subject_id = s.id
       ${whereClause}
       ORDER BY cs.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      dataParams,
    );

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM contact_submissions cs ${whereClause}`,
      params,
    );

    res.json({
      submissions: submissionsRes.rows,
      total: countRes.rows[0].total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(countRes.rows[0].total / parseInt(limit, 10)),
    });
  } catch (err) {
    console.error("admin.listSubmissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

exports.approveSubmission = async (req, res) => {
  const submissionId = req.params.id;
  const { admin_notes } = req.body; // Admin can optionally add notes, nothing else needed

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch submission — all resource metadata was collected at submission time
    const subRes = await client.query(
      "SELECT * FROM contact_submissions WHERE id = $1 FOR UPDATE",
      [submissionId],
    );

    if (subRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Submission not found" });
    }

    const sub = subRes.rows[0];

    if (sub.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Submission already reviewed" });
    }

    if (sub.category !== "resource") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          error: "Only resource submissions can be approved into the library",
        });
    }

    // Validate that required resource fields were collected at submission time
    if (!sub.subject_id || !sub.resource_type) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          error:
            "Submission is missing subject or resource type — cannot approve",
        });
    }

    // Resolve resource_type name → id
    const typeRes = await client.query(
      "SELECT id FROM resource_types WHERE name = $1",
      [sub.resource_type.toUpperCase()],
    );

    if (typeRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Invalid resource type on submission" });
    }

    const resourceTypeId = typeRes.rows[0].id;

    // Use resource_url if provided, otherwise fall back to attachment_path
    const finalUrl = sub.resource_url?.trim() || sub.attachment_path;

    if (!finalUrl) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Submission has no URL or attachment to use" });
    }

    // Use submitter's message as the title if no better title exists
    const title = sub.message?.trim() || "Untitled Resource";

    // Insert into resources
    await client.query(
      `INSERT INTO resources (title, url, subject_id, resource_type, year)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        title,
        finalUrl,
        sub.subject_id,
        resourceTypeId,
        sub.resource_year || null,
      ],
    );

    // Mark submission as reviewed
    await client.query(
      `UPDATE contact_submissions
       SET status = 'reviewed', reviewed_at = NOW(), admin_notes = $1
       WHERE id = $2`,
      [admin_notes?.trim() || null, submissionId],
    );

    await client.query("COMMIT");
    res.json({
      message: "Resource added to library and submission marked as reviewed",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("admin.approveSubmission:", err);
    res.status(500).json({ error: "Failed to approve submission" });
  } finally {
    client.release();
  }

  exports.dismissSubmission = async (req, res) => {
    const submissionId = req.params.id;
    const { admin_notes } = req.body;

    try {
      const result = await pool.query(
        `UPDATE contact_submissions
       SET status = 'dismissed', reviewed_at = NOW(), admin_notes = $1
       WHERE id = $2 AND status = 'pending'
       RETURNING id`,
        [admin_notes?.trim() || null, submissionId],
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Submission not found or already reviewed" });
      }

      res.json({ message: "Submission dismissed" });
    } catch (err) {
      console.error("admin.dismissSubmission:", err);
      res.status(500).json({ error: "Failed to dismiss submission" });
    }
  };
};
