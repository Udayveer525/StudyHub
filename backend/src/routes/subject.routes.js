const express = require("express");
const router = express.Router();
const {
  getSubjectsBySemester,
} = require("../controllers/subject.controller");

router.get("/", getSubjectsBySemester);

module.exports = router;
