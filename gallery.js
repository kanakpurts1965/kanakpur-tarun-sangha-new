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


           const previewPhotos = photos.slice(0,6);

const photosHTML = previewPhotos.map((photo,index)=>{

const photoURL =
typeof photo==="string"
?photo
:photo.url||"";

const remain =
photos.length-6;

return `

<button
type="button"
class="public-gallery-photo-btn"
data-group="${item.id}"
data-index="${index}">

<img
src="${safeAttribute(photoURL)}"
alt="${safeAttribute(data.heading||"Gallery Photo")}"
loading="lazy">

${
index===5 && remain>0
?`

<div class="gallery-overlay">

<span>+${remain}</span>

</div>

`
:""
}

</button>

`;

}).join("");

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

document.addEventListener("click",(e)=>{

const btn=e.target.closest(".public-gallery-photo-btn");

if(!btn)return;

const group=btn.closest(".public-gallery-group");

const allPhotos=[];

group.querySelectorAll("img").forEach(img=>{

allPhotos.push(img.src);

});

const modalGrid=
document.getElementById("galleryModalGrid");

modalGrid.innerHTML="";

allPhotos.forEach(src=>{

modalGrid.insertAdjacentHTML(

"beforeend",

`

<div class="gallery-full-photo">

<img src="${src}" loading="lazy">

</div>

`

);

});

document
.getElementById("galleryModal")
.classList.add("show");

document.body.style.overflow="hidden";

});
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
