import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
rom "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const commentForm = document.getElementById("commentForm");

if (commentForm) {

  commentForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const contact = document.getElementById("contact").value.trim();

    const comment = document.getElementById("comment").value.trim();

    if (!name || !comment) {

      alert("নাম এবং মন্তব্য লিখুন।");

      return;

    }

    try {

      await addDoc(collection(db, "comments"), {

        name: name,

        contact: contact,

        comment: comment,

        page: "Home",

        createdAt: serverTimestamp()

      });

      alert("✅ মন্তব্য সফলভাবে জমা হয়েছে।");

      commentForm.reset();

    } catch (err) {

      console.error(err);

      alert("❌ মন্তব্য জমা হয়নি।");

    }

  });

}
