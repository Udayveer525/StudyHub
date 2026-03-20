// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../auth/auth.middleware");
const adminMiddleware = require("../auth/adminMiddleware");
const {
  getStats,
  listReports,
  resolveReport,
  dismissReport,
  listSubmissions,
  approveSubmission,
  dismissSubmission,
} = require("../controllers/admin.controller");

// All admin routes require both auth + admin role
router.use(authMiddleware, adminMiddleware);

// Stats
router.get("/stats", getStats);

// Reports
router.get("/reports", listReports);
router.post("/reports/:id/resolve", resolveReport);
router.post("/reports/:id/dismiss", dismissReport);

// Contact Submissions
router.get("/submissions", listSubmissions);
router.post("/submissions/:id/approve", approveSubmission);
router.post("/submissions/:id/dismiss", dismissSubmission);

module.exports = router;