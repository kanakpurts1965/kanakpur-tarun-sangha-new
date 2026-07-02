import { db } from "./firebase.js"; 

import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const repliesRef = collection(db, "replies");

const menuReplies = document.getElementById("menuReplies");

if (menuReplies) {

    menuReplies.addEventListener("click", () => {

        const page = document.getElementById("pageContent");

        page.innerHTML = `

<h2>💬 Reply Management</h2>

<div id="adminReplies">

Loading...

</div>

`;

        const adminReplies = document.getElementById("adminReplies");

        onSnapshot(repliesRef, (snapshot) => {

            adminReplies.innerHTML = "";

            if (snapshot.empty) {

                adminReplies.innerHTML = "কোনো Reply নেই।";

                return;

            }

            snapshot.forEach((item) => {

                const data = item.data();

                const card = document.createElement("div");

                card.className = "admin-comment";

               card.innerHTML = `

<div class="reply-header">

<h3>

${
data.isAdmin
? '👑 <span class="admin-badge">ADMIN</span>'
: '👤 ' + data.name
}

</h3>

</div>

<div class="reply-body">

<p>${data.text}</p>

</div>

<div class="reply-info">

🆔 Comment ID:
${data.commentId || "Not Found"}

</div>

<div class="admin-actions">

<button
class="admin-reply"
data-comment="${data.commentId}">

👑 Admin Reply

</button>

<button
class="edit-reply"
data-id="${item.id}"
data-text="${data.text}">

✏ Edit

</button>

<button
class="delete-reply"
data-id="${item.id}">

🗑 Delete

</button>

</div>

`;

                adminReplies.appendChild(card);

            });

        });

    });

}

// ==========================================
// DELETE REPLY
// ==========================================

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".delete-reply");

    if (!btn) return;

    if (!confirm("এই Reply Delete করবেন?")) return;

    try {

        await deleteDoc(
            doc(db, "replies", btn.dataset.id)
        );

        alert("✅ Reply সফলভাবে Delete হয়েছে");

    }

    catch (err) {

        console.error(err);

        alert("❌ Reply Delete Failed");

    }

});

// ==========================================
// EDIT REPLY
// ==========================================

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".edit-reply");

    if (!btn) return;

    const newReply = prompt(
        "নতুন Reply লিখুন:",
        btn.dataset.text
    );

    if (newReply === null) return;

    if (newReply.trim() === "") {

        alert("Reply খালি রাখা যাবে না।");

        return;

    }

    try {

        await updateDoc(
            doc(db, "replies", btn.dataset.id),
            {
                text: newReply.trim()
            }
        );

        alert("✅ Reply Update হয়েছে");

    }

    catch (err) {

        console.error(err);

        alert("❌ Reply Update Failed");

    }

});

// ==========================================
// ADMIN REPLY
// ==========================================

document.addEventListener("click", async (e)=>{
     const btn = e.target.closest(".admin-reply");
if(!btn) return;

const text=prompt("Admin Reply লিখুন");

if(text===null) return;

if(text.trim()===""){

alert("Reply খালি রাখা যাবে না");

return;

}

try {

    await addDoc(collection(db, "replies"), {

        commentId: btn.dataset.comment,

        name: "ADMIN",

        text: text.trim(),

        isAdmin: true,

        likes: 0,

        createdAt: serverTimestamp()

    });

  
const commentId = btn.dataset.comment;

if (!commentId || commentId === "undefined") {

    alert("❌ Comment ID পাওয়া যায়নি");

    return;

}
  await addDoc(collection(db, "replies"), {

        commentId: commentId,

        name: "ADMIN",

        text: text.trim(),

        isAdmin: true,

        likes: 0,

        createdAt: serverTimestamp()

    });   
      alert("✅ Admin Reply পাঠানো হয়েছে");

}
catch(err){

    console.error(err);

    alert("❌ Reply পাঠানো যায়নি");

}
});
// ==========================================
// ADMIN REPLY FROM WEBSITE
// ==========================================

document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".admin-reply-btn");

    if (!btn) return;

    const text = prompt("Admin Reply লিখুন");

    if (text === null) return;

    if (text.trim() === "") {

        alert("Reply খালি রাখা যাবে না");

        return;

    }

    try {

        await addDoc(repliesRef, {

            commentId: btn.dataset.id,

            name: "ADMIN",

            text: text.trim(),

            isAdmin: true,

            likes: 0,

            createdAt: serverTimestamp()

        });

        alert("✅ Admin Reply পাঠানো হয়েছে");

    }

    catch(err){

        console.error(err);

        alert("❌ Reply পাঠানো যায়নি");

    }

});
