alert("Firebase JS Loaded");

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSxn1dAA708KyKOfrLP_nTrBnazrFjPT8",
  authDomain: "kanakpur-tarun-sangha-42e7b.firebaseapp.com",
  projectId: "kanakpur-tarun-sangha-42e7b",
  storageBucket: "kanakpur-tarun-sangha-42e7b.firebasestorage.app",
  messagingSenderId: "1062615905207",
  appId: "1:1062615905207:web:53e520f0696aeb0daa6e32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

console.log("✅ Firebase Connected");
console.log("✅ Firestore Connected");
window.db = db;
export { db };
