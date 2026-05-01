import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfq79DrInq_jxNoxRZCQTijStmT5mhhHU",
  authDomain: "nmubooking.firebaseapp.com",
  projectId: "nmubooking",
  storageBucket: "nmubooking.firebasestorage.app",
  messagingSenderId: "1062389697596",
  appId: "1:1062389697596:web:cc6d1056b673dd06aa8739"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth, ref, onValue };
