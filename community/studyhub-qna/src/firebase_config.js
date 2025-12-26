import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWt0MuzQWBHHkPT9ohUjg-O1KsOG3-p1I",
  authDomain: "studyhub-database-63908.firebaseapp.com",
  projectId: "studyhub-database-63908",
  storageBucket: "studyhub-database-63908.firebasestorage.app",
  messagingSenderId: "252585159511",
  appId: "1:252585159511:web:62651ff532950e99642c12",
  measurementId: "G-8442ZB0875"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const serverTimestampFn = serverTimestamp;
export { auth, db };