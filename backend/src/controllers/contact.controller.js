// controllers/contact.controller.js
const pool = require("../config/db");

const VALID_CATEGORIES = ["resource", "bug", "query"];

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    const userId = req.user?.userId || null;
    // Build full URL so the frontend can link directly to the file on the backend server
    // req.file.path is a relative path like "uploads/filename.pdf"
    const backendUrl = process.env.BACKEND_URL || "";
    const attachmentPath = req.file
      ? `${backendUrl}/${req.file.path.replace(/\\/g, "/")}`
      : null;

    if (!name || !email || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const safeCategory = VALID_CATEGORIES.includes(category)
      ? category
      : "query";

    // Resource-specific fields (only present when category === "resource")
    const subjectId = req.body.subject_id
      ? parseInt(req.body.subject_id, 10)
      : null;
    const resourceType = req.body.resource_type || null;
    const resourceUrl = req.body.resource_url || null;
    const resourceYear = req.body.resource_year
      ? parseInt(req.body.resource_year, 10)
      : null;

    // Message is optional for resource submissions
    const safeMessage =
      message?.trim() ||
      (safeCategory === "resource" ? "Resource submission" : null);
    if (safeCategory !== "resource" && !safeMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await pool.query(
      `INSERT INTO contact_submissions
         (user_id, name, email, category, message, attachment_path,
          subject_id, resource_type, resource_url, resource_year,
          status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',NOW())
       RETURNING id`,
      [
        userId,
        name,
        email,
        safeCategory,
        safeMessage,
        attachmentPath,
        subjectId,
        resourceType,
        resourceUrl,
        resourceYear,
      ],
    );

    res.status(201).json({
      success: true,
      ticketId: result.rows[0].id,
      message: "Submission received successfully",
    });
  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ error: "Failed to submit form" });
  }
};
