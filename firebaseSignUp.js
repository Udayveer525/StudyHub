import { auth, createUserWithEmailAndPassword, updateProfile } from "./firebaseConfig.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
  // Sign-Up Logic (for signUp.html)
  const signUpForm = document.getElementById("signUp-form");
  if (signUpForm) {
    signUpForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      document.getElementById("signUp-btn").disabled = true;
      
      // These fields should exist on the sign-up page
      const name = document.querySelector('input[type="text"]').value;
      const email = document.querySelector('input[type="email"]').value;
      const password = document.querySelectorAll('input[type="password"]')[0].value;
      const course = document.getElementById('course') ? document.getElementById('course').value : "";  
      const semester = document.getElementById('semester') ? document.getElementById('semester').value : "";
  
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Save additional data in Firestore using the user's UID
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          course: course,
          semester: semester,
          createdAt: new Date().toISOString()
        });
        showToast(`Welcome, ${name}! Your account has been created.`, "success");
        setTimeout(() => { window.location.href = "index.html"; }, 2000);
      } catch (error) {
        showToast(`Error: ${error.message}`, "error");
        document.getElementById("signUp-btn").disabled = false;
      }
    });
  }
});
