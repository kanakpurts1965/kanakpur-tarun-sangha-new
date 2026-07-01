import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
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

        const box = document.getElementById("adminReplies");

        onSnapshot(repliesRef, (snapshot) => {

            box.innerHTML = "";

            if (snapshot.empty) {

                box.innerHTML = "কোনো Reply নেই।";

                return;

            }

            snapshot.forEach((item) => {

                const data = item.data();

                const card = document.createElement("div");

                card.className = "admin-comment";

                card.innerHTML = `

<h3>${data.name}</h3>

<p>${data.text}</p>

<div class="admin-actions">

<button
class="delete-reply"
data-id="${item.id}">

🗑 Delete

</button>

<button
class="edit-reply"
data-id="${item.id}"
data-text="${data.text}">

✏ Edit

</button>

</div>

`;

                box.appendChild(card);

            });

        });

    });

}
