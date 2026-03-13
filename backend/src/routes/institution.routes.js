const express = require("express");
const router = express.Router();
const controller = require("../controllers/institution.controller");

router.get("/", controller.getInstitutions);

module.exports = router;
