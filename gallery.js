// =====================================================
// KTS PUBLIC GALLERY
// FIRESTORE REAL-TIME GALLERY
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const publicGallery =
    document.getElementById("publicGallery");


const galleryRef =
    collection(db, "gallery");


const galleryQuery =
    query(
        galleryRef,
        orderBy("createdAt", "desc")
    );


// =====================================================
// LOAD GALLERY
// =====================================================

onSnapshot(

    galleryQuery,

    (snapshot) => {

        if (!publicGallery) return;


        publicGallery.innerHTML = "";


        if (snapshot.empty) {

            publicGallery.innerHTML = `

                <div class="gallery-empty">

                    🖼️ বর্তমানে Gallery-তে কোনো ছবি নেই।

                </div>

            `;

            return;
        }


        snapshot.forEach((item) => {

            const data =
                item.data();


            const card =
                document.createElement("div");


            card.className =
                "public-gallery-card";


            card.innerHTML = `

                <img

                    src="${data.photo || ""}"

                    alt="${safe(
                        data.caption ||
                        "Gallery Photo"
                    )}"

                    loading="lazy"

                    class="public-gallery-photo"

                >


                ${
                    data.caption

                    ? `

                    <div class="gallery-caption">

                        ${safe(data.caption)}

                    </div>

                    `

                    : ""
                }

            `;


            const image =
                card.querySelector(
                    ".public-gallery-photo"
                );


            image.addEventListener(
                "click",
                () => {

                    openGalleryLightbox(

                        data.photo,

                        data.caption || ""

                    );

                }
            );


            publicGallery.appendChild(card);

        });

    },

    (error) => {

        console.error(
            "PUBLIC GALLERY ERROR:",
            error
        );


        if (publicGallery) {

            publicGallery.innerHTML = `

                <div class="gallery-empty">

                    ❌ Gallery Load করা যায়নি।

                </div>

            `;

        }

    }

);


// =====================================================
// LIGHTBOX OPEN
// =====================================================

function openGalleryLightbox(
    photoURL,
    caption
) {

    const lightbox =
        document.getElementById(
            "galleryLightbox"
        );


    const lightboxImage =
        document.getElementById(
            "galleryLightboxImage"
        );


    const lightboxCaption =
        document.getElementById(
            "galleryLightboxCaption"
        );


    lightboxImage.src =
        photoURL;


    lightboxCaption.textContent =
        caption;


    lightbox.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


// =====================================================
// LIGHTBOX CLOSE
// =====================================================

document
    .getElementById(
        "galleryLightboxClose"
    )
    ?.addEventListener(
        "click",
        closeGalleryLightbox
    );


document
    .getElementById(
        "galleryLightbox"
    )
    ?.addEventListener(
        "click",
        (event) => {

            if (
                event.target.id ===
                "galleryLightbox"
            ) {

                closeGalleryLightbox();

            }

        }
    );


document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeGalleryLightbox();

        }

    }
);


function closeGalleryLightbox() {

    const lightbox =
        document.getElementById(
            "galleryLightbox"
        );


    if (!lightbox) return;


    lightbox.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


// =====================================================
// SAFE TEXT
// =====================================================

function safe(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
