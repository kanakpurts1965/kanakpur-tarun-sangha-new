// ==========================================
// FIREBASE IMPORT
// ==========================================
 
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    increment,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const form = document.getElementById("commentForm");
const commentsBox = document.getElementById("comments");
const msg = document.getElementById("msg");

const commentsRef = collection(db, "comments");
const repliesRef = collection(db, "replies");


// ==========================================
// COMMENT SUBMIT
// ==========================================

if(form){

form.addEventListener("submit",async(e)=>{

e.preventDefault();

msg.innerHTML="⏳ মন্তব্য পাঠানো হচ্ছে...";

try{

await addDoc(commentsRef,{

name:document.getElementById("name").value.trim(),

contact:document.getElementById("contact").value.trim(),

comment:document.getElementById("comment").value.trim(),

page:"Home",

likes:0,

pinned:false,

createdAt:serverTimestamp()

});

form.reset();

msg.innerHTML="✅ মন্তব্য সফলভাবে পাঠানো হয়েছে";

}

catch(err){

console.error(err);

msg.innerHTML="❌ মন্তব্য পাঠানো যায়নি";

}

});

}


// ==========================================
// QUERY
// ==========================================

const q = query(

commentsRef,

orderBy("pinned", "desc"),

orderBy("createdAt", "desc")

);

// ==========================================
// REAL TIME COMMENT LOAD
// ==========================================

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

card.className = data.pinned
    ? "comment-card pinned"
    : "comment-card";

        card.innerHTML = `

<div class="comment-header">

<div class="comment-avatar">
👤
</div>

<div class="comment-info">

<div class="comment-name">

${data.name}

${data.pinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}

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

<button
class="like-btn"
data-id="${item.id}">

👍 ${data.likes || 0}

</button>

<button
class="reply-btn"
data-id="${item.id}">

💬 Reply

</button>

</div>

<div id="reply-list-${item.id}"></div>

`;

        commentsBox.appendChild(card);

        // ===========================
        // LOAD REPLIES
        // ===========================

        const replyBox = document.getElementById(`reply-list-${item.id}`);

        const replyQuery = query(

            repliesRef,

            where("commentId", "==", item.id),

            orderBy("createdAt", "asc")

        );

        onSnapshot(replyQuery, (replySnap) => {

            replyBox.innerHTML = "";

            replySnap.forEach((replyDoc) => {

                const reply = replyDoc.data();

                const div = document.createElement("div");

                div.className = "reply-card";

                let replyDate = "";

                if (reply.createdAt) {

                    replyDate = reply.createdAt
                        .toDate()
                        .toLocaleString("bn-BD", {

                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"

                        });

                }

                div.innerHTML = `

<div class="reply-header">

<div class="reply-avatar">

👤

</div>

<div>

<div class="reply-name">

    ${
        reply.isAdmin
        ? '👑 <span class="admin-badge">ADMIN</span>'
        : "👤 " + reply.name
    }

</div>

<div class="reply-date">

🕒 ${replyDate}

</div>

</div>

</div>

<div class="reply-text">

${reply.text}

</div>

`;

                replyBox.appendChild(div);

            });

        });

    });

});

// ==========================================
// LIKE BUTTON
// ==========================================

document.addEventListener("click", async (e) => {

    const likeBtn = e.target.closest(".like-btn");

    if (!likeBtn) return;

    try {

        await updateDoc(
            doc(db, "comments", likeBtn.dataset.id),
            {
                likes: increment(1)
            }
        );

    } catch (err) {

        console.error("Like Error:", err);

    }

});


// ==========================================
// REPLY BOX
// ==========================================

document.addEventListener("click", (e) => {

    const btn = e.target.closest(".reply-btn");

    if (!btn) return;

    const id = btn.dataset.id;

    const replyArea = document.getElementById(`reply-list-${id}`);

    if (!replyArea) return;

    if (replyArea.querySelector(".reply-box")) return;

    replyArea.insertAdjacentHTML("beforeend", `

<div class="reply-box">

<input
type="text"
id="reply-name-${id}"
placeholder="আপনার নাম">

<textarea
id="reply-text-${id}"
placeholder="আপনার উত্তর লিখুন..."></textarea>

<button
class="reply-submit"
data-id="${id}">

📩 Reply পাঠান

</button>

</div>

`);

});


// ==========================================
// REPLY SUBMIT
// ==========================================

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".reply-submit");

    if (!btn) return;

    const id = btn.dataset.id;

    const name = document
        .getElementById(`reply-name-${id}`)
        .value
        .trim();

    const text = document
        .getElementById(`reply-text-${id}`)
        .value
        .trim();

    if (!name || !text) {

        alert("নাম ও Reply লিখুন");

        return;

    }

    try {

        await addDoc(repliesRef, {

            commentId: id,

            name,

            text,
             isAdmin: false,
            likes: 0,

            createdAt: serverTimestamp()

        });

        alert("✅ Reply সফলভাবে পাঠানো হয়েছে");

    }

    catch (err) {

        console.error(err);

        alert("❌ Reply পাঠানো যায়নি");

    }

});
