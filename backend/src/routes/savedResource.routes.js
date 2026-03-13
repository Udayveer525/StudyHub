const express = require("express");
const router = express.Router();
const controller = require("../controllers/savedResource.controller");
const authMiddleware = require("../auth/auth.middleware");

router.post("/resources/:id/save", authMiddleware, controller.toggleSaveResource);
router.get("/resources/saved/:id", authMiddleware, controller.getSavedResources);

module.exports = router;
