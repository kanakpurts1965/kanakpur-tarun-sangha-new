// ==========================================
// FIREBASE IMPORT
// ==========================================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const form = document.getElementById("commentForm");
const commentsBox = document.getElementById("comments");
const msg = document.getElementById("msg");

const commentsRef = collection(db, "comments");


// ==========================================
// COMMENT SUBMIT
// ==========================================

if (form) {

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    msg.innerHTML = "⏳ মন্তব্য পাঠানো হচ্ছে...";

    try {

      await addDoc(commentsRef, {

        name: document.getElementById("name").value.trim(),

        contact: document.getElementById("contact").value.trim(),

        comment: document.getElementById("comment").value.trim(),

        page: "Home",

        likes: 0,

        createdAt: serverTimestamp()

      });

      form.reset();

      msg.innerHTML = "✅ মন্তব্য সফলভাবে পাঠানো হয়েছে।";

    } catch (err) {

      console.error(err);

      msg.innerHTML = "❌ মন্তব্য পাঠানো যায়নি।";

    }

  });

}
// ==========================================
// REAL-TIME COMMENT LOAD
// ==========================================

const q = query(
    commentsRef,
    orderBy("createdAt", "desc")
);

onSnapshot(q, (snapshot) => {

    commentsBox.innerHTML = "";

    if (snapshot.empty) {

        commentsBox.innerHTML = `
            <div class="loading-comments">
                📝 এখনও কোনো মন্তব্য নেই।
            </div>
        `;

        return;
    }

    snapshot.forEach((item) => {

        const data = item.data();

        let dateText = "এইমাত্র";

        if (data.createdAt) {

            dateText = data.createdAt
                .toDate()
                .toLocaleString("bn-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });

        }

        const card = document.createElement("div");

        card.className = "comment-card";

        card.innerHTML = `
            <div class="comment-header">

                <div class="comment-avatar">
                    👤
                </div>

                <div class="comment-info">

                    <div class="comment-name">
                        ${data.name}
                    </div>

                    <div class="comment-date">
                        🕒 ${dateText}
                    </div>

                </div>

            </div>

            <div class="comment-body">
                ${data.comment}
            </div>

            <div class="comment-actions">

                <button class="like-btn"
                        data-id="${item.id}">
                    👍 ${data.likes || 0}
                </button>

                <button class="reply-btn"
                        data-id="${item.id}">
                    💬 Reply
                </button>

            </div>

            <div id="reply-list-${item.id}"></div>
        `;

        commentsBox.appendChild(card);

    });

});
// ==========================================
// LIKE BUTTON
// ==========================================

document.addEventListener("click", async (e) => {

    const likeBtn = e.target.closest(".like-btn");

    if (!likeBtn) return;

    const commentId = likeBtn.dataset.id;

    try {

        await updateDoc(doc(db, "comments", commentId), {

            likes: increment(1)

        });

    } catch (err) {

        console.error("Like Error:", err);

    }

});
