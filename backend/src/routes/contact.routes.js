// routes/contact.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { submitContactForm } = require("../controllers/contact.controller");
const optionalAuth = require("../auth/optionalAuth.middleware");

// 1. Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Files will be saved in the 'uploads' directory
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp-randomString.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// 2. Initialize Multer with the storage config and a 10MB size limit
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit to match our frontend UI
});

// 3. Define the POST route
// We use optionalAuth to grab the user ID if they are logged in.
// upload.single("attachment") tells Multer to look for a file field named "attachment".
router.post("/", optionalAuth, upload.single("attachment"), submitContactForm);

module.exports = router;