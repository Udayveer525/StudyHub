// auth/auth.controller.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail, sendWelcomeEmail } = require("../services/email.service");

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate a secure random verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO users (name, email, password_hash, is_verified, verification_token)
       VALUES ($1, $2, $3, false, $4)`,
      [name, email, hashedPassword, verificationToken]
    );

    // Send verification email — fire and forget (don't block response)
    sendVerificationEmail(email, name, verificationToken).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error("register:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is missing" });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = true, verification_token = NULL
       WHERE verification_token = $1 AND is_verified = false
       RETURNING id, name, email`,
      [token]
    );

    if (result.rows.length === 0) {
      // Could be already verified or invalid token
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }

    const { name, email } = result.rows[0];
      
    // Send welcome email after successful verification
    sendWelcomeEmail(email, name).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("verifyEmail:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, password_hash, role, is_verified FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Block unverified users with a specific error code the frontend can act on
    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
        email: email, // so the frontend can offer a resend link
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, is_verified, verification_token FROM users WHERE email = $1",
      [email]
    );

    // Always respond with success to prevent email enumeration
    if (result.rows.length === 0 || result.rows[0].is_verified) {
      return res.json({ message: "If that email exists and is unverified, a new link has been sent." });
    }

    const user = result.rows[0];

    // Generate a fresh token
    const newToken = crypto.randomBytes(32).toString("hex");

    await pool.query(
      "UPDATE users SET verification_token = $1 WHERE id = $2",
      [newToken, user.id]
    );

    sendVerificationEmail(email, user.name, newToken).catch((err) =>
      console.error("Failed to resend verification email:", err)
    );

    res.json({ message: "If that email exists and is unverified, a new link has been sent." });
  } catch (err) {
    console.error("resendVerification:", err);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, name, email, role, current_title, current_level FROM users WHERE id = $1",
      [req.user.userId]
    );
    const achievements = await pool.query(
      "SELECT title, level, earned_at FROM achievements WHERE user_id = $1 ORDER BY level",
      [req.user.userId]
    );

    user.rows[0].achievements = achievements.rows;
    res.json(user.rows[0]);
  } catch (err) {
    console.error("getMe:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};