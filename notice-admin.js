import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const noticesRef =
    collection(db, "notices");


const noticeTitle =
    document.getElementById("noticeTitle");

const noticeDate =
    document.getElementById("noticeDate");

const noticeText =
    document.getElementById("noticeText");

const saveNoticeBtn =
    document.getElementById("saveNoticeBtn");

const adminNoticeList =
    document.getElementById("adminNoticeList");


let editingNoticeId = null;


// ========================================
// SAVE / UPDATE
// ========================================

saveNoticeBtn?.addEventListener(
    "click",
    async () => {

        const title =
            noticeTitle.value.trim();

        const date =
            noticeDate.value;

        const text =
            noticeText.value.trim();


        if (!title) {

            alert("Notice Title লিখুন");

            return;
        }


        if (!date) {

            alert("Notice Date নির্বাচন করুন");

            return;
        }


        if (!text) {

            alert("Notice Details লিখুন");

            return;
        }


        try {

            saveNoticeBtn.disabled = true;


            if (editingNoticeId) {

                saveNoticeBtn.textContent =
                    "⏳ Update হচ্ছে...";


                await updateDoc(

                    doc(
                        db,
                        "notices",
                        editingNoticeId
                    ),

                    {
                        title,
                        date,
                        text,
                        updatedAt:
                            serverTimestamp()
                    }

                );


                alert(
                    "✅ Notice Update হয়েছে"
                );

            }

            else {

                saveNoticeBtn.textContent =
                    "⏳ Save হচ্ছে...";


                await addDoc(

                    noticesRef,

                    {
                        title,
                        date,
                        text,
                        createdAt:
                            serverTimestamp()
                    }

                );


                alert(
                    "✅ Notice Save হয়েছে"
                );

            }


            clearNoticeForm();

        }

        catch (error) {

            console.error(
                "NOTICE SAVE ERROR:",
                error
            );


            alert(
                "❌ Notice Save হয়নি: " +
                error.message
            );

        }

        finally {

            saveNoticeBtn.disabled =
                false;

        }

    }
);


// ========================================
// LOAD NOTICE
// ========================================

const noticeQuery =
    query(
        noticesRef,
        orderBy("date", "desc")
    );


onSnapshot(

    noticeQuery,

    (snapshot) => {

        if (!adminNoticeList) return;


        adminNoticeList.innerHTML = "";


        if (snapshot.empty) {

            adminNoticeList.innerHTML =
                "<p>কোনো Notice নেই।</p>";

            return;
        }


        snapshot.forEach((item) => {

            const data =
                item.data();


            const card =
                document.createElement("div");


            card.className =
                "admin-notice-card";


            card._noticeData = {

                id: item.id,

                ...data

            };


            card.innerHTML = `

                <div class="admin-notice-info">

                    <h3>
                        ${safe(data.title)}
                    </h3>

                    <p>
                        📅 ${safe(data.date)}
                    </p>

                    <p>
                        ${safe(data.text)}
                    </p>

                </div>


                <div class="admin-notice-actions">

                    <button
                        type="button"
                        class="edit-notice-btn"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        type="button"
                        class="delete-notice-btn"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            adminNoticeList
                .appendChild(card);

        });

    }

);


// ========================================
// EDIT + DELETE
// ========================================

document.addEventListener(

    "click",

    async (event) => {


        const editBtn =
            event.target.closest(
                ".edit-notice-btn"
            );


        if (editBtn) {

            const card =
                editBtn.closest(
                    ".admin-notice-card"
                );


            const data =
                card._noticeData;


            editingNoticeId =
                data.id;


            noticeTitle.value =
                data.title || "";

            noticeDate.value =
                data.date || "";

            noticeText.value =
                data.text || "";


            saveNoticeBtn.textContent =
                "🔄 Notice Update করুন";


            document
                .getElementById(
                    "noticePage"
                )
                ?.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });


            return;
        }


        const deleteBtn =
            event.target.closest(
                ".delete-notice-btn"
            );


        if (deleteBtn) {

            const card =
                deleteBtn.closest(
                    ".admin-notice-card"
                );


            const data =
                card._noticeData;


            if (
                !confirm(
                    `"${data.title}" Notice Delete করবেন?`
                )
            ) {

                return;
            }


            try {

                deleteBtn.disabled = true;


                await deleteDoc(

                    doc(
                        db,
                        "notices",
                        data.id
                    )

                );


                if (
                    editingNoticeId ===
                    data.id
                ) {

                    clearNoticeForm();

                }


                alert(
                    "✅ Notice Delete হয়েছে"
                );

            }

            catch (error) {

                console.error(error);


                deleteBtn.disabled =
                    false;


                alert(
                    "❌ Delete হয়নি"
                );

            }

        }

    }

);


// ========================================
// CLEAR
// ========================================

function clearNoticeForm() {

    noticeTitle.value = "";

    noticeDate.value = "";

    noticeText.value = "";

    editingNoticeId = null;

    saveNoticeBtn.textContent =
        "💾 Notice Save করুন";

}


// ========================================
// SAFE TEXT
// ========================================

function safe(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
