import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
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

        commentsBox.innerHTML += `

