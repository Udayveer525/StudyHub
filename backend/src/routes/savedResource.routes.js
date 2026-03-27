const express = require("express");
const router = express.Router();
const controller = require("../controllers/savedResource.controller");
const authMiddleware = require("../auth/auth.middleware");

router.post("/resources/:id/save", authMiddleware, controller.toggleSaveResource);
router.get("/resources/saved", authMiddleware, controller.getSavedResources);
router.get("/users/stats",      authMiddleware, controller.getUserStats);

module.exports = router;