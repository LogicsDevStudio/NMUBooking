import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, get, update, push, child, onValue, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfq79DrInq_jxNoxRZCQTijStmT5mhhHU",
  authDomain: "nmubooking.firebaseapp.com",
  databaseURL: "https://nmubooking-default-rtdb.asia-southeast1.firebasedatabase.app", // 🟢 เพิ่มบรรทัดนี้ลงไป
  projectId: "nmubooking",
  storageBucket: "nmubooking.firebasestorage.app",
  messagingSenderId: "1062389697596",
  appId: "1:1062389697596:web:cc6d1056b673dd06aa8739"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Google Apps Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXdJR6r3kB_TkJjBa0-O6lVy4vjxe3wSnudwSRbIEIGX9g7SCKgOWnsYy15heEjYhw/exec";

export { db, auth, ref, set, get, update, push, child, onValue, remove, runTransaction, signInWithEmailAndPassword, onAuthStateChanged, signOut, GOOGLE_SCRIPT_URL };
