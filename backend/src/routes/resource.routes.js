const express = require("express");
const router = express.Router();
const {
  getResourcesBySubject, searchResources, getRecentResources
} = require("../controllers/resource.controller");
const optionalAuth = require("../auth/optionalAuth.middleware");

router.get("/", optionalAuth, getResourcesBySubject);
router.get("/search", searchResources);
router.get("/recent", getRecentResources);

module.exports = router;
