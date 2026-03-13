const fs = require("fs");
const path = require("path");

// ---------- CONFIG ----------
const INPUT_FILE = path.join(__dirname, "studyMaterials.json");
const OUTPUT_FILE = path.join(__dirname, "extractedData.json");

// ---------- HELPERS ----------
const MONTH_REGEX = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
const YEAR_REGEX = /\b(19|20)\d{2}\b/;

function extractSemesterNumber(key) {
  const match = key.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function cleanSubjectName(title) {
  if (!title) return null;

  return title
    .replace(YEAR_REGEX, "")
    .replace(MONTH_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractYear(title) {
  const match = title.match(YEAR_REGEX);
  return match ? parseInt(match[0], 10) : null;
}

// ---------- MAIN ----------
function extractData(rawData) {
  const degrees = new Set();
  const semesters = [];
  const subjects = [];
  const resources = [];

  const pyqDedupSet = new Set();

  for (const courseKey of Object.keys(rawData)) {
    const degreeName = courseKey.toUpperCase();
    degrees.add(degreeName);

    const course = rawData[courseKey];

    for (const semesterKey of Object.keys(course)) {
      const semesterNumber = extractSemesterNumber(semesterKey);
      if (!semesterNumber) continue;

      semesters.push({
        degree: degreeName,
        number: semesterNumber,
      });

      const semester = course[semesterKey];

      for (const subjectCode of Object.keys(semester)) {
        const subjectBlock = semester[subjectCode];

        let subjectName = subjectCode; // fallback
        if (Array.isArray(subjectBlock)) {
          const firstPyq = subjectBlock.find((x) => x.title);
          if (firstPyq) {
            subjectName = cleanSubjectName(firstPyq.title) || subjectCode;
          }
        }

        subjects.push({
          degree: degreeName,
          semester: semesterNumber,
          code: subjectCode,
          name: subjectName,
        });

        // ---------- PYQs ----------
        if (Array.isArray(subjectBlock)) {
          for (const pyq of subjectBlock) {
            if (!pyq.title || !pyq.link) continue;

            const year = extractYear(pyq.title);
            const dedupKey = `${degreeName}|${semesterNumber}|${subjectCode}|${pyq.title}|${year}`;

            if (pyqDedupSet.has(dedupKey)) continue;
            pyqDedupSet.add(dedupKey);

            resources.push({
              degree: degreeName,
              semester: semesterNumber,
              subject: subjectCode,
              type: "PYQ",
              title: pyq.title.trim(),
              year: year,
              url: pyq.link,
              difficulty: null,
            });
          }
        }

        // ---------- VIDEOS ----------
        console.log(subjectBlock[subjectBlock.length - 1].videos);
        if (Array.isArray(subjectBlock[subjectBlock.length - 1].videos)) {
          for (const video of subjectBlock[subjectBlock.length - 1].videos) {
            if (!video.title || !video.link) continue;

            resources.push({
              degree: degreeName,
              semester: semesterNumber,
              subject: subjectCode,
              type: "VIDEO",
              title: video.title.trim(),
              year: null,
              url: video.link,
              difficulty: null,
            });
          }
        }
      }
    }
  }

  return {
    degrees: Array.from(degrees).map((name) => ({ name })),
    semesters,
    subjects,
    resources,
  };
}

// ---------- RUN ----------
(function run() {
  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  const extracted = extractData(raw);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extracted, null, 2), "utf-8");

  console.log("✅ Extraction complete");
  console.log(`Degrees:   ${extracted.degrees.length}`);
  console.log(`Semesters: ${extracted.semesters.length}`);
  console.log(`Subjects:  ${extracted.subjects.length}`);
  console.log(`Resources: ${extracted.resources.length}`);
})();
