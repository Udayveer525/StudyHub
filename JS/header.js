import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  const headerUserStatus = document.getElementById('greeting');
  if (user) {
    // User is signed in
    headerUserStatus.innerHTML = `
      <span>Hi, ${user.displayName}</span>`;
  } else {
    // No user is signed in
    headerUserStatus.innerHTML = `Welcome to`;
  }
});
