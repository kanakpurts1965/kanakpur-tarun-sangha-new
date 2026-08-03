// ======================================
// GALLERY V2
// PART 1
// ======================================

let galleryPhotos = [];
let currentPhoto = 0;

function createGalleryPreview(photos){

const preview = photos.slice(0,6);

return preview.map((photo,index)=>{

const remain = photos.length-6;

return `

<div
class="gallery-item"
data-index="${index}">

<img
src="${photo}"
loading="lazy">

${
index===5 && remain>0
?

`<div class="gallery-overlay">

<span>+${remain}</span>

</div>`

:""

}

</div>

`;

}).join("");

}

function openGallery(index){

currentPhoto=index;

document
.getElementById("galleryLightbox")
.classList.add("show");

showPhoto();

}

function showPhoto(){

document
.getElementById("galleryLightboxImage")
.src=

galleryPhotos[currentPhoto];

document
.getElementById("galleryCounter")
.innerHTML=

`${currentPhoto+1} / ${galleryPhotos.length}`;

}
// ======================================
// GALLERY V2
// PART 2
// ======================================

document.addEventListener("click",(e)=>{

const card=e.target.closest(".gallery-item");

if(!card)return;

currentPhoto=Number(card.dataset.index);

openGallery(currentPhoto);

});

function closeGallery(){

document
.getElementById("galleryLightbox")
.classList.remove("show");

}

document
.getElementById("galleryLightboxClose")
.addEventListener("click",closeGallery);

document
.getElementById("galleryLightbox")
.addEventListener("click",(e)=>{

if(e.target.id==="galleryLightbox")

closeGallery();

});

function nextPhoto(){

currentPhoto++;

if(currentPhoto>=galleryPhotos.length)

currentPhoto=0;

showPhoto();

}

function prevPhoto(){

currentPhoto--;

if(currentPhoto<0)

currentPhoto=

galleryPhotos.length-1;

showPhoto();

}
// ======================================
// GALLERY V2
// PART 3
// ======================================

document.addEventListener("keydown",(e)=>{

if(!document
.getElementById("galleryLightbox")
.classList.contains("show")) return;

if(e.key==="ArrowRight") nextPhoto();

if(e.key==="ArrowLeft") prevPhoto();

if(e.key==="Escape") closeGallery();

});

document
.getElementById("galleryNext")
.addEventListener("click",nextPhoto);

document
.getElementById("galleryPrev")
.addEventListener("click",prevPhoto);


// ======================================
// LOAD GALLERY
// ======================================

onSnapshot(galleryGroupsQuery,(snapshot)=>{

publicGalleryGroups.innerHTML="";

snapshot.forEach((doc)=>{

const data=doc.data();

galleryPhotos=(data.photos||[]).map(p=>

typeof p==="string"

?p

:p.url

);

const html=`

<section class="public-gallery-group">

<div class="gallery-group-header">

<h2>${data.heading}</h2>

<p>${data.caption||""}</p>

</div>

<div class="gallery-grid">

${createGalleryPreview(galleryPhotos)}

</div>

</section>

`;

publicGalleryGroups.insertAdjacentHTML(

"beforeend",

html

);

});

});
// ======================================
// GALLERY V2
// PART 4
// ======================================

let touchStartX=0;
let touchEndX=0;

const lightbox=
document.getElementById("galleryLightbox");

lightbox.addEventListener("touchstart",(e)=>{

touchStartX=e.changedTouches[0].screenX;

});

lightbox.addEventListener("touchend",(e)=>{

touchEndX=e.changedTouches[0].screenX;

handleSwipe();

});

function handleSwipe(){

const diff=touchStartX-touchEndX;

if(diff>60){

nextPhoto();

}

if(diff<-60){

prevPhoto();

}

}


// ===============================
// PRELOAD IMAGE
// ===============================

function preload(){

galleryPhotos.forEach(src=>{

const img=new Image();

img.src=src;

});

}


// ===============================
// ZOOM EFFECT
// ===============================

galleryLightboxImage.addEventListener(

"click",

()=>{

galleryLightboxImage.classList.toggle(

"zoom"

);

}

);


// ===============================
// AUTO PRELOAD
// ===============================

window.addEventListener(

"load",

()=>{

preload();

}

);
// ======================================
// GALLERY V2
// PART 5
// FINAL
// ======================================

// SHOW TOTAL PHOTO

function updateCounter(){

document.getElementById("galleryCounter").innerHTML=

`${currentPhoto+1} / ${galleryPhotos.length}`;

}


// NEXT

function nextPhoto(){

currentPhoto++;

if(currentPhoto>=galleryPhotos.length){

currentPhoto=0;

}

galleryLightboxImage.src=

galleryPhotos[currentPhoto];

updateCounter();

}


// PREVIOUS

function prevPhoto(){

currentPhoto--;

if(currentPhoto<0){

currentPhoto=

galleryPhotos.length-1;

}

galleryLightboxImage.src=

galleryPhotos[currentPhoto];

updateCounter();

}


// CLOSE

function closeGallery(){

galleryLightbox.classList.remove("show");

galleryLightboxImage.src="";

document.body.style.overflow="";

}


// OPEN

function openGallery(index){

currentPhoto=index;

galleryLightbox.classList.add("show");

galleryLightboxImage.src=

galleryPhotos[currentPhoto];

updateCounter();

document.body.style.overflow="hidden";

}


// BUTTON

galleryLightboxClose.onclick=

closeGallery;

document.getElementById("galleryNext").onclick=

nextPhoto;

document.getElementById("galleryPrev").onclick=

prevPhoto;


// ESC

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape")

closeGallery();

});


// END
