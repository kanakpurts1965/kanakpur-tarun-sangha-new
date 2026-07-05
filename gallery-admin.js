// =====================================================
// KTS GALLERY ADMIN SYSTEM
// MULTIPLE PHOTO + CLOUDINARY + FIRESTORE
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// =====================================================
// CONFIG
// =====================================================

const CLOUD_NAME = "wf6ocs3j";

const UPLOAD_PRESET = "kts_members";

const galleryRef =
    collection(db, "gallery");


// =====================================================
// ELEMENTS
// =====================================================

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


// =====================================================
// SELECTED PHOTOS
// =====================================================

let selectedGalleryPhotos = [];


// =====================================================
// MULTIPLE PHOTO SELECT + PREVIEW
// =====================================================

galleryPhotoFile?.addEventListener(
    "change",
    () => {

        selectedGalleryPhotos =
            Array.from(
                galleryPhotoFile.files
            );


        if (!selectedGalleryPhotos.length) {

            galleryPreviewBox.style.display =
                "none";

            galleryPreview.src = "";

            return;
        }


        // প্রথম ছবির Preview

        galleryPreview.src =
            URL.createObjectURL(
                selectedGalleryPhotos[0]
            );


        galleryPreviewBox.style.display =
            "block";


        console.log(
            "Selected Photos:",
            selectedGalleryPhotos.length
        );

    }
);


// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

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


    const uploadURL =

        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {

                controller.abort();

            },
            60000
        );


    try {

        const response =
            await fetch(

                uploadURL,

                {
                    method: "POST",

                    body: formData,

                    signal:
                        controller.signal
                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data?.error?.message ||

                "Gallery Photo Upload Failed"

            );

        }


        return {

            photoURL:
                data.secure_url,

            publicId:
                data.public_id

        };

    }

    finally {

        clearTimeout(timeout);

    }

}


// =====================================================
// SAVE MULTIPLE PHOTOS
// =====================================================

saveGalleryBtn?.addEventListener(
    "click",
    async () => {

        const caption =
            galleryCaption.value.trim();


        if (!selectedGalleryPhotos.length) {

            alert(
                "❌ আগে ছবি নির্বাচন করুন"
            );

            return;

        }


        try {

            saveGalleryBtn.disabled =
                true;


            const total =
                selectedGalleryPhotos.length;


            let uploadedCount = 0;


            // একটার পর একটা Upload

            for (
                let i = 0;
                i < total;
                i++
            ) {

                saveGalleryBtn.textContent =

                    `📤 Upload হচ্ছে ${i + 1}/${total}`;


                const uploaded =

                    await uploadGalleryPhoto(

                        selectedGalleryPhotos[i]

                    );


                saveGalleryBtn.textContent =

                    `💾 Save হচ্ছে ${i + 1}/${total}`;


                await addDoc(

                    galleryRef,

                    {

                        caption:
                            caption,

                        photo:
                            uploaded.photoURL,

                        photoPublicId:
                            uploaded.publicId,

                        createdAt:
                            serverTimestamp()

                    }

                );


                uploadedCount++;

            }


            alert(

                `✅ ${uploadedCount}টি ছবি Upload হয়েছে`

            );


            // FORM CLEAR

            galleryCaption.value = "";

            galleryPhotoFile.value = "";

            selectedGalleryPhotos = [];

            galleryPreview.src = "";

            galleryPreviewBox.style.display =
                "none";

        }

        catch (error) {

            console.error(
                "GALLERY UPLOAD ERROR:",
                error
            );


            if (
                error.name === "AbortError"
            ) {

                alert(
                    "❌ Photo Upload Timeout হয়েছে"
                );

            }

            else {

                alert(

                    "❌ Upload হয়নি: " +

                    error.message

                );

            }

        }

        finally {

            saveGalleryBtn.disabled =
                false;


            saveGalleryBtn.textContent =
                "📤 ছবি Upload করুন";

        }

    }
);


// =====================================================
// GALLERY QUERY
// =====================================================

const galleryQuery =
    query(

        galleryRef,

        orderBy(
            "createdAt",
            "desc"
        )

    );


// =====================================================
// ADMIN GALLERY LIST
// =====================================================

onSnapshot(

    galleryQuery,

    (snapshot) => {

        if (!adminGalleryList) return;


        adminGalleryList.innerHTML = "";


        if (snapshot.empty) {

            adminGalleryList.innerHTML =

                "<p>Gallery-তে কোনো ছবি নেই।</p>";

            return;

        }


        snapshot.forEach(
            (item) => {

                const data =
                    item.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-gallery-card";


                card.innerHTML = `

                    <img

                        src="${data.photo || ""}"

                        alt="Gallery Photo"

                        loading="lazy"

                        style="
                            width:150px;
                            height:100px;
                            object-fit:cover;
                            border-radius:10px;
                        "

                    >


                    <div>

                        <p>

                            ${safe(
                                data.caption ||
                                "No Caption"
                            )}

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


                adminGalleryList
                    .appendChild(card);

            }
        );

    },

    (error) => {

        console.error(
            "GALLERY LIST ERROR:",
            error
        );


        if (adminGalleryList) {

            adminGalleryList.innerHTML =

                "<p>❌ Gallery Load হয়নি।</p>";

        }

    }

);


// =====================================================
// DELETE GALLERY PHOTO
// =====================================================

document.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                ".delete-gallery-btn"
            );


        if (!button) return;


        const photoId =
            button.dataset.id;


        const confirmDelete =
            confirm(
                "এই Gallery Photo Delete করবেন?"
            );


        if (!confirmDelete) return;


        try {

            button.disabled = true;

            button.textContent =
                "⏳ Deleting...";


            await deleteDoc(

                doc(
                    db,
                    "gallery",
                    photoId
                )

            );


            alert(
                "✅ Gallery Photo Delete হয়েছে"
            );

        }

        catch (error) {

            console.error(
                "GALLERY DELETE ERROR:",
                error
            );


            button.disabled = false;

            button.textContent =
                "🗑️ Delete";


            alert(

                "❌ Delete হয়নি: " +

                error.message

            );

        }

    }
);


// =====================================================
// SAFE TEXT
// =====================================================

function safe(value = "") {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
