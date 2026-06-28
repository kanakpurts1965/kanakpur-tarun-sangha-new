alert("Step 1");

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

alert("Step 2");

const firebaseConfig = {
  apiKey: "AIzaSyCSxn1dAA708KyKOfrLP_nTrBnazrFjPT8",
  authDomain: "kanakpur-tarun-sangha-42e7b.firebaseapp.com",
  projectId: "kanakpur-tarun-sangha-42e7b",
  storageBucket: "kanakpur-tarun-sangha-42e7b.firebasestorage.app",
  messagingSenderId: "1062615905207",
  appId: "1:1062615905207:web:53e520f0696aeb0daa6e32"
};

const app = initializeApp(firebaseConfig);

alert("Step 3");

const db = getFirestore(app);

alert("Step 4");

try {

  const docRef = await addDoc(collection(db, "comments"), {

    name: "Test User",

    contact: "6296062310",

    comment: "Firebase Test Successful",

    page: "Home",

    time: new Date()

  });

  alert("✅ Firestore Write Success");

  console.log("Document ID:", docRef.id);

} catch (e) {

  alert("❌ Firestore Error");

  console.error(e);

}
