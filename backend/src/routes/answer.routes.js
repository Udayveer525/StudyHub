const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");

const {
  voteAnswer,
  acceptAnswer,
} = require("../controllers/answer.controller");

// Vote on an answer (value: 1 or -1)
router.post("/:id/vote", authMiddleware, voteAnswer);

// Accept an answer (question owner only)
router.post("/:id/accept", authMiddleware, acceptAnswer);

module.exports = router;
