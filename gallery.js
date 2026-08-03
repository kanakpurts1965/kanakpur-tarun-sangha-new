// ======================================
// GALLERY V3
// PART 1
// ======================================

import { db } from "./firebase.js";

import {
collection,
query,
orderBy,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const publicGalleryGroups=
document.getElementById("publicGalleryGroups");

const galleryRef=
collection(db,"galleryGroups");

const galleryQuery=
query(
galleryRef,
orderBy("createdAt","desc")
);

window.galleryGroups=[];

function safe(text=""){

return String(text)
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");

}

onSnapshot(galleryQuery,(snapshot)=>{

window.galleryGroups=[];

publicGalleryGroups.innerHTML="";

snapshot.forEach(doc=>{

const data=doc.data();

window.galleryGroups.push({

id:doc.id,

...data

});

const photos=

Array.isArray(data.photos)

?data.photos

:[];

const previewPhotos = photos.slice(0,6);

const photosHTML = previewPhotos.map((photo,index)=>{

const photoURL =
typeof photo==="string"
?photo
:photo.url||"";

const remain = photos.length-6;

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

${index===5 && remain>0 ? `
<div class="gallery-overlay">
<span>+${remain}</span>
</div>
` : ""}

</button>

`;

}).join("");
const remain=

photos.length-6;

let html="";

preview.forEach((photo,index)=>{

const src=

typeof photo==="string"

?photo

:photo.url||"";

html+=`

<button
class="gallery-preview"
data-id="${doc.id}">

<img
src="${safe(src)}"
loading="lazy">

${
index===5&&remain>0

?`

<div class="gallery-count">

+${remain}

</div>

`

:""

}

</button>

`;

});

publicGalleryGroups.insertAdjacentHTML(

"beforeend",

`

<section class="gallery-group">

<h2>${safe(data.heading||"")}</h2>

<p>${safe(data.caption||"")}</p>

<div class="gallery-grid">

${html}

</div>

</section>

`

);

});

});
// ======================================
// GALLERY V3
// PART 2
// ======================================

const galleryViewer =
document.getElementById("galleryViewer");

const galleryViewerGrid =
document.getElementById("galleryViewerGrid");

const galleryViewerClose =
document.getElementById("galleryViewerClose");

const photoViewer =
document.getElementById("photoViewer");

const photoViewerImage =
document.getElementById("photoViewerImage");

const photoViewerClose =
document.getElementById("photoViewerClose");


// ======================================
// OPEN GALLERY
// ======================================

document.addEventListener("click",(e)=>{

const btn=e.target.closest(".gallery-preview");

if(!btn)return;

const id=btn.dataset.id;

const group=

window.galleryGroups.find(

x=>x.id===id

);

if(!group)return;

galleryViewerGrid.innerHTML="";

group.photos.forEach(photo=>{

const src=

typeof photo==="string"

?photo

:photo.url||"";

galleryViewerGrid.insertAdjacentHTML(

"beforeend",

`

<img
class="gallery-grid-photo"
src="${src}"
loading="lazy">

`

);

});

galleryViewer.classList.add("show");

document.body.style.overflow="hidden";

});


// ======================================
// OPEN PHOTO
// ======================================

document.addEventListener("click",(e)=>{

if(!e.target.classList.contains("gallery-grid-photo"))

return;

photoViewerImage.src=e.target.src;

photoViewer.classList.add("show");

});


// ======================================
// CLOSE
// ======================================

galleryViewerClose.onclick=()=>{

galleryViewer.classList.remove("show");

document.body.style.overflow="";

};

photoViewerClose.onclick=()=>{

photoViewer.classList.remove("show");

photoViewerImage.src="";

};

galleryViewer.onclick=(e)=>{

if(e.target===galleryViewer){

galleryViewer.classList.remove("show");

document.body.style.overflow="";

}

};

photoViewer.onclick=(e)=>{

if(e.target===photoViewer){

photoViewer.classList.remove("show");

photoViewerImage.src="";

}

};

// ======================================
// GALLERY V3
// PART 3
// ======================================

// ESC

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

galleryViewer.classList.remove("show");

photoViewer.classList.remove("show");

photoViewerImage.src="";

document.body.style.overflow="";

}

});


// CLICK OUTSIDE

galleryViewer.addEventListener("click",(e)=>{

if(e.target===galleryViewer){

galleryViewer.classList.remove("show");

document.body.style.overflow="";

}

});

photoViewer.addEventListener("click",(e)=>{

if(e.target===photoViewer){

photoViewer.classList.remove("show");

photoViewerImage.src="";

}

});


// IMAGE ZOOM

document.addEventListener("click",(e)=>{

if(!e.target.classList.contains("gallery-grid-photo"))

return;

e.target.classList.toggle("zoom");

});


// PRELOAD

function preload(list){

list.forEach(src=>{

const img=new Image();

img.src=

typeof src==="string"

?src

:src.url||"";

});

}

window.addEventListener("load",()=>{

window.galleryGroups.forEach(group=>{

preload(group.photos);

});

});


// ======================================
// GALLERY V3
// PART 4 (FINAL)
// ======================================

// CLOSE BUTTONS

galleryViewerClose?.addEventListener("click",()=>{

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

});

photoViewerClose?.addEventListener("click",()=>{

photoViewer.classList.remove("show");

photoViewerImage.src="";

});


// CLICK OUTSIDE

galleryViewer?.addEventListener("click",(e)=>{

if(e.target===galleryViewer){

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

}

});

photoViewer?.addEventListener("click",(e)=>{

if(e.target===photoViewer){

photoViewer.classList.remove("show");

photoViewerImage.src="";

}

});


// ESC

document.addEventListener("keydown",(e)=>{

if(e.key!=="Escape") return;

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

photoViewer.classList.remove("show");

photoViewerImage.src="";

document.body.style.overflow="";

});


// DOUBLE CLICK ZOOM

document.addEventListener("dblclick",(e)=>{

if(!e.target.classList.contains("gallery-grid-photo"))

return;

e.target.classList.toggle("zoom");

});


// IMAGE LOAD ERROR

document.addEventListener("error",(e)=>{

if(e.target.tagName!=="IMG") return;

e.target.src="123.png.png";

},true);


// READY

console.log("Gallery Viewer V3 Loaded");
