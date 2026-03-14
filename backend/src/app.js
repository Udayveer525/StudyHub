const express = require("express");

const app = express();
const cors = require("cors");

app.use(cors({
  origin: ["http://localhost:5173", "https://your-studyhub-app.netlify.app"],
  credentials: true
}));

app.use(express.json());

const degreeRoutes = require("./routes/degree.routes");
const semesterRoutes = require("./routes/semester.routes");
const subjectRoutes = require("./routes/subject.routes");
const resourceRoutes = require("./routes/resource.routes");
const savedResourceRoutes = require("./routes/savedResource.routes");
const hierarchyRoutes = require("./routes/hierarchy.routes");
const institutionRoutes = require("./routes/institution.routes");

const authRoutes = require("./auth/auth.routes");

const questionRoutes = require("./routes/question.routes");
const answerRoutes = require("./routes/answer.routes");

const contactRoutes = require("./routes/contact.routes");

app.use("/api/institutions", institutionRoutes);
app.use("/api/degrees", degreeRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api", savedResourceRoutes);

app.use("/api", hierarchyRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);

app.use("/api/contact", contactRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("StudyHub API is running");
});

module.exports = app;
