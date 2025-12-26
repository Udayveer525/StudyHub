// profile.js
import { auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
  // References to DOM elements on the profile page:
  const avatarElem = document.querySelector('.avatar');
  const profileInfoElem = document.querySelector('.profile-info');
  const profileActionsElem = document.querySelector('.profile-actions');
  const signOutBtn = document.getElementById("signout-btn");
  const editBtn = document.getElementById('edit-btn');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in. Try to load additional info from Firestore.
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userData = {};
        if (userDocSnap.exists()) {
          userData = userDocSnap.data();
        } else {
          // Fallback to basic auth data if no extra details are stored
          userData = {
            name: user.displayName || "No Name Provided",
            email: user.email || "No Email",
            course: "Not set",
            semester: "Not set"
          };
        }
        
        // Update the profile info section
        profileInfoElem.innerHTML = `
        <h2>${userData.name}</h2>
        <p>Email: ${userData.email}</p>
        <p>Course: <span id="user-course">${userData.course}</span></p>
        <p>Semester: <span id="user-semester">${userData.semester}</span></p>
        `;
        
        // Update the avatar with initials (if no photo is available)
        const initials = userData.name.split(" ").map(n => n[0]).join("").toUpperCase();
        avatarElem.textContent = initials;
        
        // Optionally, you can also add a sign-out button listener here (if not already set up in your global header)
        if (signOutBtn) {
          signOutBtn.addEventListener("click", async () => {
            try {
              await auth.signOut();
            } catch (error) {
              console.error("Error signing out:", error);
            }
          });
        }
         // Edit button logic
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          // Check if we're in view mode (spans exist) or edit mode (inputs already exist)
          const courseSpan = document.getElementById("user-course");
          const semSpan = document.getElementById("user-semester");
          
          // If in view mode, switch to edit mode
          if (courseSpan && semSpan) {
            // Create input fields prefilled with current values
            const courseInput = document.createElement("input");
            courseInput.type = "text";
            courseInput.id = "user-course-input";
            courseInput.value = courseSpan.textContent;
            courseInput.style.fontSize = "1rem";
            courseInput.style.width = "150px";
            
            const semInput = document.createElement("input");
            semInput.type = "text";
            semInput.id = "user-semester-input";
            semInput.value = semSpan.textContent;
            semInput.style.fontSize = "1rem";
            semInput.style.width = "150px";
            
            // Replace static spans with these input fields
            courseSpan.parentElement.replaceChild(courseInput, courseSpan);
            semSpan.parentElement.replaceChild(semInput, semSpan);
            
            // Change edit button text to "Save"
            editBtn.textContent = "Save";
            // Create a Cancel button next to the Save button
            let cancelBtn = document.createElement("button");
            cancelBtn.id = "cancel-btn";
            cancelBtn.textContent = "Cancel";
            cancelBtn.style.marginLeft = "10px";
            cancelBtn.style.padding = "10px 20px";
            cancelBtn.style.borderRadius = "30px";
            cancelBtn.style.border = "none";
            cancelBtn.style.cursor = "pointer";
            cancelBtn.style.background = "#F44336";
            cancelBtn.style.color = "#fff";
            cancelBtn.style.fontSize = "16px";
            editBtn.parentElement.appendChild(cancelBtn);
            
            // Cancel: revert inputs back to original spans
            cancelBtn.addEventListener("click", () => {
              const revertCourseSpan = document.createElement("span");
              revertCourseSpan.id = "user-course";
              revertCourseSpan.textContent = courseInput.value;
              courseInput.parentElement.replaceChild(revertCourseSpan, courseInput);
              
              const revertSemSpan = document.createElement("span");
              revertSemSpan.id = "user-semester";
              revertSemSpan.textContent = semInput.value;
              semInput.parentElement.replaceChild(revertSemSpan, semInput);
              
              // Restore the edit button text and remove the Cancel button
              editBtn.textContent = "Edit Profile";
              cancelBtn.remove();
            });
            
            // Save: update Firestore and UI
            // Remove any duplicate event listeners by using the 'once' option
            editBtn.addEventListener("click", async function saveHandler() {
              // Read updated values from inputs
              const updatedCourse = document.getElementById("user-course-input").value;
              const updatedSemester = document.getElementById("user-semester-input").value;
              
              try {
                // Update Firestore with the new course and semester
                await updateDoc(doc(db, "users", user.uid), {
                  course: updatedCourse,
                  semester: updatedSemester
                });
                
                // Update UI: replace inputs with new spans
                const updatedCourseSpan = document.createElement("span");
                updatedCourseSpan.id = "user-course";
                updatedCourseSpan.textContent = updatedCourse;
                document.getElementById("user-course-input").parentElement.replaceChild(updatedCourseSpan, document.getElementById("user-course-input"));
                
                const updatedSemSpan = document.createElement("span");
                updatedSemSpan.id = "user-semester";
                updatedSemSpan.textContent = updatedSemester;
                document.getElementById("user-semester-input").parentElement.replaceChild(updatedSemSpan, document.getElementById("user-semester-input"));
                
                // Restore button texts and remove Cancel button
                editBtn.textContent = "Edit Profile";
                cancelBtn.remove();
                alert("Profile Updated Successfully");
              } catch (error) {
                alert("Error updating profile: " + error.message);
              }
            }, { once: true });
          } // end if in view mode
        }); // end editBtn click listener
      }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      // No user is signed in; show a prompt to create an account.
      avatarElem.style.display = "none";
      profileActionsElem.style.display = "none";
      profileInfoElem.innerHTML = `
        <div style="text-align: center; margin-top: 50px; font-family: 'Poppins', sans-serif;">
          <h2>No user is signed in</h2>
          <p>Please <a href="signUp.html" style="color: #0078FF; text-decoration: underline;">create an account</a> or <a href="signIn.html" style="color: #0078FF; text-decoration: underline;">login to an existing one</a> to view your profile.</p> <br><br>
          Go to <a href="index.html" style="color: #0078FF; text-decoration: underline;">Home</a>
        </div>
      `;
    }
  });
});
