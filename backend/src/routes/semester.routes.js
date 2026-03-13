const express = require("express");
const router = express.Router();
const {
  getSemestersByDegree,
} = require("../controllers/semester.controller");

router.get("/", getSemestersByDegree);

module.exports = router;
