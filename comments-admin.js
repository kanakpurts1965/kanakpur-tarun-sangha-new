
import { db } from "./firebase.js";


import {
    collection,
    onSnapshot,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const commentsRef = collection(db, "comments");

document.getElementById("menuComments").onclick = () => {

    const page = document.getElementById("pageContent");

    page.innerHTML = `
        <h2>💬 Comment Management</h2>
        <div id="adminComments">Loading...</div>
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

            adminComments.innerHTML += `

            <div class="admin-comment">

                <h3>${data.name}</h3>

                <p>${data.comment}</p>

               <div class="admin-actions">

    <button class="edit-comment"
            data-id="${item.id}"
            data-comment="${data.comment}">
        ✏ Edit
    </button>

    <button class="delete-comment"
            data-id="${item.id}">
        🗑 Delete
    </button>

</div>

            </div>

            `;

        });

    });

};


document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".delete-comment");

    if (!btn) return;

    if (!confirm("এই Comment Delete করবেন?")) return;

    try {

        await deleteDoc(doc(db, "comments", btn.dataset.id));

        alert("✅ Comment Delete হয়েছে");

    } catch (err) {

        console.error(err);

        alert("❌ Delete Failed");

    }

});
