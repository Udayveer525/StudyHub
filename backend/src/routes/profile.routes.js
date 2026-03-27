// routes/profile.routes.js
const express = require("express");
const router  = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/profile.controller");

router.get("/:userId",  getProfile);                       // public
router.put("/:userId",  authMiddleware, updateProfile);    // own profile only

module.exports = router;