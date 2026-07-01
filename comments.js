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

const q=query(

commentsRef,

orderBy("createdAt","desc")

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

        card.className = "comment-card";

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

${reply.name}

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
