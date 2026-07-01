import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
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
