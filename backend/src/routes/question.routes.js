const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");

const {
  createQuestion,
  listQuestions,
  getQuestionById,
  addAnswer,
  getAnswersByQuestion,
} = require("../controllers/question.controller");

// Questions
router.post("/", authMiddleware, createQuestion);
router.get("/", listQuestions);
router.get("/:id", getQuestionById);

// Answers (nested under question)
router.post("/:id/answers", authMiddleware, addAnswer);
router.get("/:id/answers", getAnswersByQuestion);

module.exports = router;
