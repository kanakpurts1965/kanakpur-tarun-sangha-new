import { db } from "./firebase.js";

import {
   collection,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const commentsRef = collection(db, "comments");

const menuComments = document.getElementById("menuComments");

if (menuComments) {

    menuComments.addEventListener("click", () => {

        const page = document.getElementById("pageContent");

        page.innerHTML = `

<h2>💬 Comment Management</h2>

<div id="adminComments">

Loading...

</div>

`;

        const adminComments = document.getElementById("adminComments");

        onSnapshot(commentsRef, (snapshot) => {

            adminComments.innerHTML = "";

            if (snapshot.empty) {

                adminComments.innerHTML = "কোনো Comment নেই।";

                return;

            }

            snapshot.forEach((item) => {

                const data = item.data();

                const card = document.createElement("div");

                card.className = "admin-comment";

                card.innerHTML = `

<h3>${data.name}</h3>

<p>${data.comment}</p>

<div class="admin-actions">

<button
class="pin-comment"
data-id="${item.id}"
data-pinned="${data.pinned || false}">

${data.pinned ? "📍 Unpin" : "📌 Pin"}

</button>

<button
class="edit-comment"
data-id="${item.id}"
data-comment="${data.comment}">

✏ Edit

</button>

<button
class="delete-comment"
data-id="${item.id}">

🗑 Delete

</button>

</div>

`;

                adminComments.appendChild(card);

            });

        });

    });

}


// ==========================================
// DELETE COMMENT
// ==========================================


document.addEventListener("click", async (e) => {

    const deleteBtn = e.target.closest(".delete-comment");

    if (deleteBtn) {

        if (!confirm("এই Comment Delete করবেন?")) return;

        try {

            await deleteDoc(
                doc(db, "comments", deleteBtn.dataset.id)
            );

            alert("✅ Comment Delete হয়েছে");

        } catch (err) {

            console.error(err);

            alert("❌ Delete Failed");

        }

        return;
    }

    const editBtn = e.target.closest(".edit-comment");

    if (editBtn) {

        const newComment = prompt(
            "নতুন Comment লিখুন:",
            editBtn.dataset.comment
        );

        if (newComment === null) return;

        if (newComment.trim() === "") {

            alert("Comment খালি রাখা যাবে না।");

            return;

        }

        try {

            await updateDoc(
                doc(db, "comments", editBtn.dataset.id),
                {
                    comment: newComment.trim()
                }
            );

            alert("✅ Comment Update হয়েছে");

        } catch (err) {

            console.error(err);

            alert("❌ Update Failed");

        }

    }

});


// ==========================================
// PIN / UNPIN COMMENT
// ==========================================

document.addEventListener("click", async (e) => {

    const pinBtn = e.target.closest(".pin-comment");

    if (!pinBtn) return;

    const commentId = pinBtn.dataset.id;
    const isPinned = pinBtn.dataset.pinned === "true";

    try {

        await updateDoc(
            doc(db, "comments", commentId),
            {
                pinned: !isPinned
            }
        );

        alert(
            isPinned
                ? "📍 Comment Unpinned"
                : "📌 Comment Pinned"
        );

    } catch (err) {

        console.error(err);

        alert("❌ Pin Update Failed");

    }

});
