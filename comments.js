import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
     doc,
    updateDoc,
    increment,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const form = document.getElementById("commentForm");
const commentsBox = document.getElementById("comments");
const msg = document.getElementById("msg");

const commentsRef = collection(db, "comments");

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

                createdAt: serverTimestamp(),

                likes: 0,

                replies: []

            });

            form.reset();

            msg.innerHTML = "✅ মন্তব্য সফলভাবে পাঠানো হয়েছে।";

        }

        catch (err) {

            console.error(err);

            msg.innerHTML = "❌ মন্তব্য পাঠানো যায়নি।";

        }

    });

}
/* ==========================================
   REAL TIME COMMENTS
========================================== */

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

    snapshot.forEach((doc) => {

        const data = doc.data();

        let dateText = "এইমাত্র";

        if (data.createdAt) {

            const date = data.createdAt.toDate();

            dateText = date.toLocaleString("bn-BD", {

                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"

            });

        }

        const commentCard = document.createElement("div");

commentCard.className = "comment-card";

commentCard.innerHTML = `

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

            <button class="like-btn" data-id="${doc.id}">
                👍 <span>${data.likes || 0}</span>
            </button>

            <button class="reply-btn" data-id="${doc.id}">
                💬 Reply
            </button>

        </div>

        <div id="reply-list-${doc.id}" class="reply-list"></div>

        `;

        commentsBox.appendChild(commentCard);

    });

});
/* ==========================================
   LIKE BUTTON
========================================== */

document.addEventListener("click", async (e) => {

    if (!e.target.closest(".like-btn")) return;

    const btn = e.target.closest(".like-btn");

    const id = btn.dataset.id;

    try {

        await updateDoc(doc(db, "comments", id), {

            likes: increment(1)

        });

    }

    catch (err) {

        console.error(err);

    }

});
/* ==========================================
   REPLY BUTTON
========================================== */

document.addEventListener("click",(e)=>{

    if(!e.target.closest(".reply-btn")) return;

    alert("🚀 Reply System Part 5 এ শুরু হবে");

});
