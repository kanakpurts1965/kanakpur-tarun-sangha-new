// =====================================================
// KTS PUBLIC GALLERY GROUP SYSTEM
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const publicGalleryGroups =
    document.getElementById("publicGalleryGroups");

const galleryLightbox =
    document.getElementById("galleryLightbox");

const galleryLightboxImage =
    document.getElementById("galleryLightboxImage");

const galleryLightboxClose =
    document.getElementById("galleryLightboxClose");


// =====================================================
// FIRESTORE
// =====================================================

const galleryGroupsRef =
    collection(db, "galleryGroups");

const galleryGroupsQuery =
    query(
        galleryGroupsRef,
        orderBy("createdAt", "desc")
    );


// =====================================================
// LOAD PUBLIC GALLERY GROUPS
// =====================================================

onSnapshot(

    galleryGroupsQuery,

    (snapshot) => {

        if (!publicGalleryGroups) {
            console.error(
                "publicGalleryGroups container পাওয়া যায়নি"
            );

            return;
        }


        publicGalleryGroups.innerHTML = "";


        if (snapshot.empty) {

            publicGalleryGroups.innerHTML = `

                <div class="gallery-empty">

                    🖼️ বর্তমানে Gallery-তে কোনো ছবি নেই।

                </div>

            `;

            return;
        }


        snapshot.forEach((item) => {

            const data =
                item.data();


            const photos =
                Array.isArray(data.photos)
                    ? data.photos
                    : [];


            const group =
                document.createElement("section");


            group.className =
                "public-gallery-group";


            const photosHTML =
                photos

                    .map((photo) => {

                        const photoURL =
                            typeof photo === "string"
                                ? photo
                                : photo.url || "";


                        return `

                            <button
                                type="button"
                                class="public-gallery-photo-btn"
                                data-photo="${safeAttribute(photoURL)}"
                            >

                                <img
                                    src="${safeAttribute(photoURL)}"
                                    alt="${safeAttribute(
                                        data.heading ||
                                        "Gallery Photo"
                                    )}"
                                    loading="lazy"
                                >

                            </button>

                        `;

                    })

                    .join("");


            group.innerHTML = `

                <div class="gallery-group-header">

                    <h2>
                        ${safe(data.heading || "")}
                    </h2>

                    ${
                        data.caption

                            ? `

                                <p>
                                    ${safe(data.caption)}
                                </p>

                              `

                            : ""
                    }

                </div>


                <div class="public-gallery-photo-grid">

                    ${photosHTML}

                </div>

            `;


            publicGalleryGroups.appendChild(group);

        });

    },

    (error) => {

        console.error(
            "PUBLIC GALLERY ERROR:",
            error
        );


        if (publicGalleryGroups) {

            publicGalleryGroups.innerHTML = `

                <div class="gallery-empty">

                    ❌ Gallery Load করা যায়নি।

                </div>

            `;

        }

    }

);


// =====================================================
// PHOTO CLICK
// =====================================================

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".public-gallery-photo-btn"
            );


        if (!button) return;


        const photoURL =
            button.dataset.photo;


        if (!photoURL) return;


        galleryLightboxImage.src =
            photoURL;


        galleryLightbox.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";

    }
);


// =====================================================
// CLOSE LIGHTBOX
// =====================================================

galleryLightboxClose?.addEventListener(
    "click",
    closeLightbox
);


galleryLightbox?.addEventListener(
    "click",
    (event) => {

        if (
            event.target === galleryLightbox
        ) {

            closeLightbox();

        }

    }
);


document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeLightbox();

        }

    }
);


function closeLightbox() {

    if (!galleryLightbox) return;


    galleryLightbox.classList.remove(
        "show"
    );


    galleryLightboxImage.src = "";


    document.body.style.overflow = "";

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


function safeAttribute(value = "") {

    return safe(value);

}
