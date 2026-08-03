// ======================================
// GALLERY V2
// gallery.js
// PART 1
// ======================================

import { db } from "./firebase.js";

import {
collection,
query,
orderBy,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const publicGalleryGroups =
document.getElementById("publicGalleryGroups");

const galleryLightbox =
document.getElementById("galleryLightbox");

const galleryLightboxImage =
document.getElementById("galleryLightboxImage");

const galleryLightboxClose =
document.getElementById("galleryLightboxClose");

const galleryNext =
document.getElementById("galleryNext");

const galleryPrev =
document.getElementById("galleryPrev");

const galleryCounter =
document.getElementById("galleryCounter");

const galleryGroupsRef =
collection(db,"galleryGroups");

const galleryGroupsQuery =
query(
galleryGroupsRef,
orderBy("createdAt","desc")
);

let currentPhotos=[];
let currentIndex=0;

function escapeHTML(text=""){

return String(text)

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");

}

function renderPreview(photos){

const preview=photos.slice(0,6);

return preview.map((photo,index)=>{

const url=

typeof photo==="string"

?photo

:photo.url||"";

const remain=

photos.length-6;

return`

<div
class="gallery-item"
data-index="${index}"
data-src="${escapeHTML(url)}">

<img
src="${escapeHTML(url)}"
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

</div>

`;

}).join("");

}

// ======================================
// GALLERY V2
// PART 2
// ======================================

function openGallery(index){

currentIndex=index;

showPhoto();

galleryLightbox.classList.add("show");

document.body.style.overflow="hidden";

}

function showPhoto(){

galleryLightboxImage.src=

currentPhotos[currentIndex];

galleryCounter.innerHTML=

`${currentIndex+1} / ${currentPhotos.length}`;

}

function nextPhoto(){

currentIndex++;

if(currentIndex>=currentPhotos.length){

currentIndex=0;

}

showPhoto();

}

function prevPhoto(){

currentIndex--;

if(currentIndex<0){

currentIndex=currentPhotos.length-1;

}

showPhoto();

}

function closeGallery(){

galleryLightbox.classList.remove("show");

galleryLightboxImage.src="";

document.body.style.overflow="";

}

galleryLightboxClose.onclick=closeGallery;

galleryNext.onclick=nextPhoto;

galleryPrev.onclick=prevPhoto;

document.addEventListener("keydown",(e)=>{

if(!galleryLightbox.classList.contains("show"))

return;

if(e.key==="ArrowRight")nextPhoto();

if(e.key==="ArrowLeft")prevPhoto();

if(e.key==="Escape")closeGallery();

});

// ======================================
// GALLERY V2
// PART 3
// ======================================

onSnapshot(galleryGroupsQuery,(snapshot)=>{

publicGalleryGroups.innerHTML="";

snapshot.forEach((item)=>{

const data=item.data();

const photos=
Array.isArray(data.photos)
?data.photos
:[];

currentPhotos=photos.map(photo=>

typeof photo==="string"
?photo
:photo.url||""

);

const section=document.createElement("section");

section.className="public-gallery-group";

section.innerHTML=`

<div class="gallery-group-header">

<h2>

${escapeHTML(data.heading||"")}

</h2>

${
data.caption
?

`<p>

${escapeHTML(data.caption)}

</p>`

:""

}

</div>

<div class="gallery-grid">

${renderPreview(currentPhotos)}

</div>

`;

publicGalleryGroups.appendChild(section);

section.querySelectorAll(".gallery-item")

.forEach(card=>{

card.onclick=()=>{

currentPhotos=photos.map(photo=>

typeof photo==="string"

?photo

:photo.url||""

);

openGallery(

Number(card.dataset.index)

);

};

});

});

});

// ======================================
// GALLERY V2
// PART 4
// ======================================

// Touch Swipe

let touchStartX = 0;
let touchEndX = 0;

galleryLightbox.addEventListener("touchstart",(e)=>{

touchStartX=e.changedTouches[0].screenX;

});

galleryLightbox.addEventListener("touchend",(e)=>{

touchEndX=e.changedTouches[0].screenX;

const diff=touchStartX-touchEndX;

if(diff>60){

nextPhoto();

}

if(diff<-60){

prevPhoto();

}

});


// Click Outside Close

galleryLightbox.addEventListener("click",(e)=>{

if(e.target===galleryLightbox){

closeGallery();

}

});


// Image Zoom

galleryLightboxImage.addEventListener("click",()=>{

galleryLightboxImage.classList.toggle("zoom");

});


// Preload Images

function preloadImages(images){

images.forEach(src=>{

const img=new Image();

img.src=src;

});

}


// Auto Preload

window.addEventListener("load",()=>{

preloadImages(currentPhotos);

});


// END OF PART 4
// ======================================
// GALLERY V2
// PART 5 (FINAL)
// ======================================

function safe(text=""){

return String(text)
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");

}

function safeAttr(text=""){

return safe(text);

}


// Close Button

galleryLightboxClose?.addEventListener(

"click",

closeGallery

);


// ESC

document.addEventListener(

"keydown",

(e)=>{

if(e.key==="Escape")

closeGallery();

}

);


// Disable Scroll

galleryLightbox?.addEventListener(

"show",

()=>{

document.body.style.overflow="hidden";

}

);


// Enable Scroll

galleryLightbox?.addEventListener(

"hide",

()=>{

document.body.style.overflow="";

}

);


// Safety

if(!publicGalleryGroups){

console.error(

"Gallery Container Not Found"

);

}

if(!galleryLightbox){

console.error(

"Lightbox Not Found"

);

}

if(!galleryLightboxImage){

console.error(

"Image Element Not Found"

);

}

if(!galleryCounter){

console.error(

"Counter Not Found"

);

}


// ======================================
// GALLERY V2 READY
// ======================================
