import {  auth } from "./firebaseConfig.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("login-form");
  const resetForm = document.getElementById("reset-password-form");
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const backToLoginBtn = document.getElementById("back-to-login");
  const formTitle = document.getElementById("form-title");

  // Check if user is already signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is already signed in, so redirect them immediately
      window.location.href = "index.html";
    }
  });

  // Sign-In Logic (for signIn.html)
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      document.getElementById("login-btn").disabled = true;

      const email = document.querySelector('#login-form input[type=\"email\"]').value.trim();
      const password = document.querySelector('#login-form input[type=\"password\"]').value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showNotification("Login successful!", "success");
        setTimeout(() => { window.location.href = "index.html"; }, 2000);
      } catch (error) {
        showNotification(error.message, "error");
        document.getElementById("login-btn").disabled = false;
      }
    });
  }

  // Handle password reset form submission
  if (resetForm) {
    resetForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const resetEmail = document.getElementById("reset-email").value;

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            showNotification("Password reset email sent! Check your inbox.", "success");
        } catch (error) {
            showNotification(error.message, "error");
        }
    });
}

  // Forget Pasword logic
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", async (event) => {
            event.preventDefault();
            loginForm.style.display = "none";
            resetForm.style.display = "block";
            formTitle.textContent = "Reset Your Password";
        });
    }

    // Back to login form
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener("click", () => {
          resetForm.style.display = "none";
          loginForm.style.display = "block";
          formTitle.textContent = "Login to Study Hub";
      });
  }
});

// Function to display notifications (styled messages instead of alerts)
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.classList.add("notification", type);
  
  document.body.appendChild(notification);

  setTimeout(() => {
      notification.remove();
  }, 3000);
}