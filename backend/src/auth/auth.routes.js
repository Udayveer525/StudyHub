const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe, 
  verifyEmail, 
  resendVerification
} = require("./auth.controller");
const authMiddleware = require("./auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.get("/me", authMiddleware, getMe);

module.exports = router;
