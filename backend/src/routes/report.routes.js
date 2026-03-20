// routes/report.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const { submitReport } = require("../controllers/report.controller");

// POST /api/reports  — authenticated users only
router.post("/", authMiddleware, submitReport);

module.exports = router;