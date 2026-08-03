// ==========================================
// gallery.js
// PART 1
// ==========================================

import { db } from "./firebase.js";

import {
collection,
query,
orderBy,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const publicGalleryGroups =
document.getElementById("publicGalleryGroups");

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

const galleryRef =
collection(db,"galleryGroups");

const galleryQuery =
query(
galleryRef,
orderBy("createdAt","desc")
);

let galleryData=[];

function safe(text=""){

return String(text)
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");

}

function getPhoto(photo){

return typeof photo==="string"
?photo
:(photo?.url||"");

}
// ==========================================
// gallery.js
// PART 2
// ==========================================

onSnapshot(galleryQuery,(snapshot)=>{

galleryData=[];

publicGalleryGroups.innerHTML="";

snapshot.forEach(doc=>{

const data=doc.data();

galleryData.push({

id:doc.id,

...data

});

const photos=

Array.isArray(data.photos)
?data.photos
:[];

const preview=

photos.slice(0,6);

const remain=

Math.max(0,photos.length-6);

let previewHTML="";

preview.forEach((photo,index)=>{

previewHTML+=`

<button
type="button"
class="gallery-preview"
data-id="${doc.id}">

<img
src="${safe(getPhoto(photo))}"
loading="lazy"
alt="${safe(data.heading||"Gallery")}">

${
index===5 && remain>0
?`

<div class="gallery-overlay">

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

<div class="gallery-group-header">

<h2>${safe(data.heading||"")}</h2>

${
data.caption
?`<p>${safe(data.caption)}</p>`
:""
}

</div>

<div class="gallery-grid">

${previewHTML}

</div>

</section>

`

);

});

});
// ==========================================
// gallery.js
// PART 3
// ==========================================

// OPEN GALLERY

document.addEventListener("click",(e)=>{

const btn=e.target.closest(".gallery-preview");

if(!btn)return;

const id=btn.dataset.id;

const group=

galleryData.find(

g=>g.id===id

);

if(!group)return;

galleryViewerGrid.innerHTML="";

(group.photos||[]).forEach(photo=>{

const src=getPhoto(photo);

galleryViewerGrid.insertAdjacentHTML(

"beforeend",

`

<div class="gallery-photo-card">

<img
class="gallery-grid-photo"
src="${safe(src)}"
loading="lazy">

</div>

`

);

});

galleryViewer.classList.add("show");

document.body.style.overflow="hidden";

});


// ==========================================
// OPEN FULL PHOTO
// ==========================================

document.addEventListener("click",(e)=>{

const img=e.target.closest(".gallery-grid-photo");

if(!img)return;

photoViewerImage.src=img.src;

photoViewer.classList.add("show");

});
// ==========================================
// gallery.js
// PART 4
// ==========================================

// CLOSE PHOTO

photoViewerClose.onclick=()=>{

photoViewer.classList.remove("show");

photoViewerImage.src="";

};


// CLOSE GALLERY

galleryViewerClose.onclick=()=>{

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

};


// CLICK OUTSIDE PHOTO

photoViewer.onclick=(e)=>{

if(e.target===photoViewer){

photoViewer.classList.remove("show");

photoViewerImage.src="";

}

};


// CLICK OUTSIDE GALLERY

galleryViewer.onclick=(e)=>{

if(e.target===galleryViewer){

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

}

};


// ESC

document.addEventListener("keydown",(e)=>{

if(e.key!=="Escape") return;

photoViewer.classList.remove("show");

photoViewerImage.src="";

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

});

// ==========================================
// gallery.js
// PART 5 (FINAL)
// ==========================================

// IMAGE ZOOM

document.addEventListener("click",(e)=>{

const img=e.target.closest(".gallery-grid-photo");

if(!img)return;

img.classList.toggle("zoom");

});


// IMAGE PRELOAD

function preloadImages(){

galleryData.forEach(group=>{

(group.photos||[]).forEach(photo=>{

const image=new Image();

image.src=getPhoto(photo);

});

});

}

window.addEventListener("load",preloadImages);


// IMAGE ERROR

document.addEventListener("error",(e)=>{

if(e.target.tagName!=="IMG") return;

e.target.src="123.png.png";

},true);


// READY

console.log("Gallery Viewer V3 Ready");
