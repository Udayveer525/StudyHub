// ollie/ollie.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const authMiddleware = require("../auth/auth.middleware");
const adminMiddleware = require("../auth/adminMiddleware");
const {
  uploadSyllabus,
  getSyllabus,
  chat,
  generateQuiz,
  submitQuiz,
  generateTimetable,
  getProgress,
  markTopicCovered,
} = require("./ollie.controller");

// ─── Rate limiter: 20 AI requests per user per hour ──────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  // Use userId when available (more accurate), fall back to IP with IPv6 helper
  keyGenerator: (req) =>
    req.user?.userId ? String(req.user.userId) : ipKeyGenerator(req),
  message: {
    error: "Too many requests — take a short break and come back! 🦉",
  },
  skip: (req) => req.user?.role === "admin", // admins unlimited for testing
});

// ─── Multer for PDF uploads ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = `syllabus-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Admin: upload syllabus PDF for a subject
router.post(
  "/syllabus/upload",
  authMiddleware,
  adminMiddleware,
  upload.single("syllabus"),
  uploadSyllabus,
);

// Auth: get syllabus + own progress for a subject
router.get("/syllabus/:subjectId", authMiddleware, getSyllabus);

// Auth + rate limited: AI interactions
router.post("/chat", authMiddleware, aiLimiter, chat);
router.post("/quiz/generate", authMiddleware, aiLimiter, generateQuiz);
router.post("/quiz/submit", authMiddleware, submitQuiz);
router.post(
  "/timetable/generate",
  authMiddleware,
  aiLimiter,
  generateTimetable,
);

// Auth: progress management
router.get("/progress/:syllabusId", authMiddleware, getProgress);
router.post("/topic/mark-covered", authMiddleware, markTopicCovered);

module.exports = router;
