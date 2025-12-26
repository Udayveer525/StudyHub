// Import Firebase Auth functions from the CDN or your firebaseConfig file
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Get the auth instance
const auth = getAuth();

// When the Get Materials button is clicked:
document.getElementById("get-materials-btn").addEventListener("click", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, load study materials.
      loadStudyMaterials();
    } else {
      // User is not signed in; redirect to the sign in page.
      window.location.href = "signUp.html"; // Adjust the URL as needed.
    }
  });
});


async function loadStudyMaterials() {
    try {
        const response = await fetch('JS/studyMaterials.json'); // Fetch JSON data
        const studyMaterials = await response.json();

        document.getElementById('studyForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const course = document.getElementById('course').value.toLowerCase();
            const semester = `Semester ${document.getElementById('semester').value}`;
            const materialsSection = document.getElementById('materialSection');

            materialsSection.innerHTML = ""; // Clear previous results

            if (studyMaterials[course] && studyMaterials[course][semester]) {
                const subjects = studyMaterials[course][semester];
                materialsSection.style.display = 'block';
                materialsSection.innerHTML = `<h3>Study Materials for ${course.toUpperCase()} - ${semester} - All Subjects</h3>`;
                let content = '<ul>';

                for (const subject in subjects) {

                    let fullSubjectName = "";

                    if (subjects[subject][0].title.includes("Dec")) {
                        fullSubjectName = subjects[subject][0].title.split(" Dec")[0].trim();
                    } else if (subjects[subject][0].title.includes("May")) {
                        fullSubjectName = subjects[subject][0].title.split(" May")[0].trim();
                    } else {
                        fullSubjectName = subject;
                    }

                    content += `<br>
                        <li>
                        <h4>${fullSubjectName}</h4>
                        <div class="accordion">

                            <!-- PYQs Accordion -->
                            <div class="accordion-item">
                                <button class="accordion-title">Past Year Questions <span class="acc-arrow"><i class="fa-solid fa-angle-down"></i></span> </button>
                                <div class="accordion-content">
                                <ul>
                                    ${subjects[subject].map(item => item.link ? `
                                        <li>
                                            <a href="${item.link}" target="_blank">${item.title}</a>
                                        </li>
                                    ` : '').join('')}
                                </ul>
                            </div>
                            </div>

                            <!-- YouTube Videos Accordion -->
                            <div class="accordion-item">
                                <button class="accordion-title">YouTube Lectures <span class="acc-arrow"><i class="fa-solid fa-angle-down"></i></span> </button>
                                <div class="accordion-content">
                                    <ul>
                                        ${
                                            subjects[subject].find(obj => obj.videos)?.videos.map(video => `
                                                <li>
                                                    <a href="${video.link}" target="_blank">${video.title}</a>
                                                </li>
                                            `).join('') || '<li>No YouTube lectures available</li>'
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </li>
                    `;
                }
                content += '</ul>';
                materialsSection.innerHTML += content;
                enableAccordion();
            } else {
                materialsSection.style.display = 'block';
                materialsSection.innerHTML = `<p>No materials found for ${course.toUpperCase()} - ${semester}</p>`;
            }
        });
    } catch (error) {
        console.error("Error loading study materials:", error);
    }
}


// Enable accordion functionality
function enableAccordion() {
    const accordions = document.querySelectorAll('.accordion-title');

    accordions.forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('active');
            const content = this.nextElementSibling;

            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });
}

// Load study materials on page load
document.addEventListener('DOMContentLoaded', loadStudyMaterials);