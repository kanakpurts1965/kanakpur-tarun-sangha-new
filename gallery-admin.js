import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const galleryRef =
    collection(db, "gallery");


const galleryPhotoFile =
    document.getElementById("galleryPhotoFile");

const galleryCaption =
    document.getElementById("galleryCaption");

const galleryPreviewBox =
    document.getElementById("galleryPreviewBox");

const galleryPreview =
    document.getElementById("galleryPreview");

const saveGalleryBtn =
    document.getElementById("saveGalleryBtn");

const adminGalleryList =
    document.getElementById("adminGalleryList");


const CLOUD_NAME = "wf6ocs3j";

/*
IMPORTANT:
এখানে Member System-এর একই Cloudinary Upload Preset Name বসাবে
*/

const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";


let selectedGalleryPhoto = null;


// PHOTO SELECT

galleryPhotoFile?.addEventListener(
    "change",
    () => {

        const file =
            galleryPhotoFile.files[0];

        if (!file) return;


        selectedGalleryPhoto = file;


        galleryPreview.src =
            URL.createObjectURL(file);


        galleryPreviewBox.style.display =
            "block";

    }
);


// CLOUDINARY UPLOAD

async function uploadGalleryPhoto(file) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const response =
        await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

            {
                method: "POST",
                body: formData
            }

        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error?.message ||
            "Photo upload failed"
        );

    }


    return {

        photoURL:
            data.secure_url,

        publicId:
            data.public_id

    };

}


// SAVE GALLERY PHOTO

saveGalleryBtn?.addEventListener(
    "click",
    async () => {

        const caption =
            galleryCaption.value.trim();


        if (!selectedGalleryPhoto) {

            alert(
                "❌ আগে একটি ছবি নির্বাচন করুন"
            );

            return;
        }


        try {

            saveGalleryBtn.disabled = true;

            saveGalleryBtn.textContent =
                "📤 Photo Upload হচ্ছে...";


            const uploaded =
                await uploadGalleryPhoto(
                    selectedGalleryPhoto
                );


            saveGalleryBtn.textContent =
                "💾 Save হচ্ছে...";


            await addDoc(

                galleryRef,

                {
                    caption,

                    photo:
                        uploaded.photoURL,

                    photoPublicId:
                        uploaded.publicId,

                    createdAt:
                        serverTimestamp()
                }

            );


            alert(
                "✅ Gallery Photo Save হয়েছে"
            );


            galleryCaption.value = "";

            galleryPhotoFile.value = "";

            selectedGalleryPhoto = null;

            galleryPreview.src = "";

            galleryPreviewBox.style.display =
                "none";

        }

        catch (error) {

            console.error(
                "GALLERY ERROR:",
                error
            );


            alert(
                "❌ Upload হয়নি: " +
                error.message
            );

        }

        finally {

            saveGalleryBtn.disabled = false;

            saveGalleryBtn.textContent =
                "📤 ছবি Upload করুন";

        }

    }
);


// ADMIN GALLERY LIST

onSnapshot(

    galleryRef,

    (snapshot) => {

        adminGalleryList.innerHTML = "";


        if (snapshot.empty) {

            adminGalleryList.innerHTML =
                "<p>Gallery-তে কোনো ছবি নেই।</p>";

            return;
        }


        snapshot.forEach((item) => {

            const data =
                item.data();


            const card =
                document.createElement("div");


            card.className =
                "admin-gallery-card";


            card.innerHTML = `

                <img
                    src="${data.photo || ""}"
                    alt="Gallery Photo"
                    style="
                        width:150px;
                        height:100px;
                        object-fit:cover;
                        border-radius:10px;
                    "
                >

                <div>

                    <p>
                        ${safe(data.caption || "No Caption")}
                    </p>

                    <button
                        type="button"
                        class="delete-gallery-btn"
                        data-id="${item.id}"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            adminGalleryList.appendChild(
                card
            );

        });

    }

);


// DELETE

document.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                ".delete-gallery-btn"
            );


        if (!button) return;


        if (
            !confirm(
                "এই Gallery Photo Delete করবেন?"
            )
        ) {

            return;
        }


        try {

            button.disabled = true;


            await deleteDoc(

                doc(
                    db,
                    "gallery",
                    button.dataset.id
                )

            );


            alert(
                "✅ Gallery Photo Delete হয়েছে"
            );

        }

        catch (error) {

            console.error(error);

            button.disabled = false;

            alert(
                "❌ Delete হয়নি"
            );

        }

    }
);


function safe(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
