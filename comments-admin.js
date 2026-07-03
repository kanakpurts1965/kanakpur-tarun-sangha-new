import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ==========================================
// COMMENTS COLLECTION
// ==========================================

const commentsRef = collection(db, "comments");


// ==========================================
// ADMIN COMMENTS CONTAINER
// ==========================================

const adminComments =
    document.getElementById("adminComments");


// ==========================================
// LOAD COMMENTS
// SPA SAFE VERSION
// ==========================================

if (adminComments) {

    onSnapshot(commentsRef, (snapshot) => {

        adminComments.innerHTML = "";


        // কোনো Comment না থাকলে

        if (snapshot.empty) {

            adminComments.innerHTML =
                "<p>কোনো Comment নেই।</p>";

            return;

        }


        // Comment Load

        snapshot.forEach((item) => {

            const data = item.data();


            const card =
                document.createElement("div");


            card.className = "admin-comment";


            card.innerHTML = `

                <h3>

                    👤 ${data.name || "Unknown"}

                </h3>


                <p>

                    ${data.comment || ""}

                </p>


                <div class="admin-actions">


                    <!-- PIN BUTTON -->

                    <button
                        class="pin-comment"
                        data-id="${item.id}"
                        data-pinned="${data.pinned || false}"
                    >

                        ${
                            data.pinned
                            ? "📍 Unpin"
                            : "📌 Pin"
                        }

                    </button>


                    <!-- EDIT BUTTON -->

                    <button
                        class="edit-comment"
                        data-id="${item.id}"
                        data-comment="${data.comment || ""}"
                    >

                        ✏ Edit

                    </button>


                    <!-- ADMIN REPLY BUTTON -->

                    <button
                        class="admin-reply-btn"
                        data-id="${item.id}"
                    >

                        👑 Admin Reply

                    </button>


                    <!-- DELETE BUTTON -->

                    <button
                        class="delete-comment"
                        data-id="${item.id}"
                    >

                        🗑 Delete

                    </button>


                </div>

            `;


            adminComments.appendChild(card);

        });

    });

}


// ==========================================
// DELETE COMMENT
// ==========================================

document.addEventListener(
    "click",

    async (e) => {


        const deleteBtn =
            e.target.closest(".delete-comment");


        if (!deleteBtn) return;


        const confirmDelete =
            confirm("এই Comment Delete করবেন?");


        if (!confirmDelete) return;


        try {


            await deleteDoc(

                doc(

                    db,

                    "comments",

                    deleteBtn.dataset.id

                )

            );


            alert(
                "✅ Comment Delete হয়েছে"
            );


        }

        catch (err) {


            console.error(err);


            alert(
                "❌ Delete Failed"
            );


        }

    }

);


// ==========================================
// EDIT COMMENT
// ==========================================

document.addEventListener(
    "click",

    async (e) => {


        const editBtn =
            e.target.closest(".edit-comment");


        if (!editBtn) return;


        const newComment = prompt(

            "নতুন Comment লিখুন:",

            editBtn.dataset.comment

        );


        if (newComment === null) return;


        if (newComment.trim() === "") {


            alert(
                "Comment খালি রাখা যাবে না।"
            );


            return;

        }


        try {


            await updateDoc(

                doc(

                    db,

                    "comments",

                    editBtn.dataset.id

                ),

                {

                    comment:
                        newComment.trim()

                }

            );


            alert(
                "✅ Comment Update হয়েছে"
            );


        }

        catch (err) {


            console.error(err);


            alert(
                "❌ Update Failed"
            );


        }

    }

);


// ==========================================
// PIN / UNPIN COMMENT
// ==========================================

document.addEventListener(
    "click",

    async (e) => {


        const pinBtn =
            e.target.closest(".pin-comment");


        if (!pinBtn) return;


        const commentId =
            pinBtn.dataset.id;


        const isPinned =
            pinBtn.dataset.pinned === "true";


        try {


            await updateDoc(

                doc(

                    db,

                    "comments",

                    commentId

                ),

                {

                    pinned:
                        !isPinned

                }

            );


            alert(

                isPinned

                    ? "📍 Comment Unpinned"

                    : "📌 Comment Pinned"

            );


        }

        catch (err) {


            console.error(err);


            alert(
                "❌ Pin Update Failed"
            );


        }

    }

);
