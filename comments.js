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
/* ==========================================
   LOAD COMMENTS
========================================== */

const commentsBox = document.getElementById("comments");

if (commentsBox) {

    const q = query(
        collection(db, "comments"),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {

        commentsBox.innerHTML = "";

        if (snapshot.empty) {

            commentsBox.innerHTML =
                "<div class='loading-comments'>এখনও কোনো মন্তব্য নেই।</div>";

            return;

        }

        snapshot.forEach((doc) => {

            const data = doc.data();

            commentsBox.innerHTML += `

            <div class="comment-card">

                <div class="comment-name">
                    👤 ${data.name}
                </div>

                <div class="comment-date">
                    📅 ${data.page ?? "Home"}
                </div>

                <div class="comment-text">
                    ${data.comment}
                </div>

            </div>

            `;

        });

    });

}
