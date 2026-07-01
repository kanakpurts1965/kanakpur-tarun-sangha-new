import { db } from "./firebase.js"; 

import {
   collection,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc
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

<h3>👤 ${data.name}</h3>

<p>${data.text}</p>

<div class="admin-actions">

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
