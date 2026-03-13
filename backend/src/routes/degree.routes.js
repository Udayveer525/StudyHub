const express = require("express");
const router = express.Router();
const { getAllDegrees } = require("../controllers/degree.controller");

router.get("/", getAllDegrees);

module.exports = router;
