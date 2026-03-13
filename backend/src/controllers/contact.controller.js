// controllers/contact.controller.js
const pool = require("../config/db");

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    
    // OptionalAuth middleware will provide this if logged in, otherwise null
    const userId = req.user?.userId || null; 
    
    // Multer attaches the file info to req.file
    const attachmentPath = req.file ? req.file.path : null;

    if (!name || !email || !category || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO contact_submissions 
        (user_id, name, email, category, message, attachment_path, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id;
    `;
    
    const values = [userId, name, email, category, message, attachmentPath];

    const result = await pool.query(query, values);

    // Send back a success response with the new ticket ID
    res.status(201).json({ 
      success: true, 
      ticketId: result.rows[0].id, 
      message: "Submission received successfully" 
    });

  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ error: "Failed to submit form" });
  }
};