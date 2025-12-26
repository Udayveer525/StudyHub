// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWt0MuzQWBHHkPT9ohUjg-O1KsOG3-p1I",
  authDomain: "studyhub-database-63908.firebaseapp.com",
  projectId: "studyhub-database-63908",
  storageBucket: "studyhub-database-63908.firebasestorage.app",
  messagingSenderId: "252585159511",
  appId: "1:252585159511:web:62651ff532950e99642c12",
  measurementId: "G-8442ZB0875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { createUserWithEmailAndPassword, updateProfile };