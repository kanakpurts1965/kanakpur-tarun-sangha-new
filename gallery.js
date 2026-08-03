

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

const galleryRef =
collection(db,"galleryGroups");

const galleryQuery =
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

function getPhoto(photo){

return typeof photo==="string"
?photo
:(photo?.url||"");

}

onSnapshot(galleryQuery,(snapshot)=>{

publicGalleryGroups.innerHTML="";

window.galleryGroups=[];

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

const preview=
photos.slice(0,6);

const remain=
Math.max(0,photos.length-6);

let previewHTML="";

preview.forEach((photo,index)=>{

previewHTML+=`

<button
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

<h2>

${safe(data.heading||"")}

</h2>

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

// OPEN FULL PHOTO

document.addEventListener("click",(e)=>{

const img=e.target.closest(".gallery-grid-photo");

if(!img)return;

photoViewerImage.src=img.src;

photoViewer.classList.add("show");

});


// CLOSE PHOTO

photoViewerClose.onclick=()=>{

photoViewer.classList.remove("show");

photoViewerImage.src="";

};


// CLICK OUTSIDE PHOTO

photoViewer.onclick=(e)=>{

if(e.target===photoViewer){

photoViewer.classList.remove("show");

photoViewerImage.src="";

}

};


// CLOSE GALLERY

galleryViewerClose.onclick=()=>{

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

};


// CLICK OUTSIDE GALLERY

galleryViewer.onclick=(e)=>{

if(e.target===galleryViewer){

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

}

};

// ==========================================
// gallery.js
// PART 4
// ==========================================

// ESC CLOSE

document.addEventListener("keydown",(e)=>{

if(e.key!=="Escape") return;

photoViewer.classList.remove("show");

photoViewerImage.src="";

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

});


// DOUBLE CLICK ZOOM

document.addEventListener("dblclick",(e)=>{

const img=e.target.closest(".gallery-grid-photo");

if(!img)return;

img.classList.toggle("zoom");

});


// PRELOAD

function preloadImages(list){

list.forEach(photo=>{

const img=new Image();

img.src=getPhoto(photo);

});

}

window.addEventListener("load",()=>{

window.galleryGroups.forEach(group=>{

preloadImages(group.photos);

});

});


// IMAGE ERROR

document.addEventListener("error",(e)=>{

if(e.target.tagName!=="IMG") return;

e.target.src="123.png.png";

},true);


// READY

console.log("Gallery V3 Loaded");

// ==========================================
// gallery.js
// PART 4
// ==========================================

// ESC CLOSE

document.addEventListener("keydown",(e)=>{

if(e.key!=="Escape") return;

photoViewer.classList.remove("show");

photoViewerImage.src="";

galleryViewer.classList.remove("show");

galleryViewerGrid.innerHTML="";

document.body.style.overflow="";

});


// DOUBLE CLICK ZOOM

document.addEventListener("dblclick",(e)=>{

const img=e.target.closest(".gallery-grid-photo");

if(!img)return;

img.classList.toggle("zoom");

});




window.addEventListener("load",()=>{

window.galleryGroups.forEach(group=>{

preloadImages(group.photos);

});

});


// IMAGE ERROR

document.addEventListener("error",(e)=>{

if(e.target.tagName!=="IMG") return;

e.target.src="123.png.png";

},true);


// READY

console.log("Gallery V3 Loaded");
