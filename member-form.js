import { db } from "./firebase.js";


import {

collection,
addDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";



const CLOUD_NAME = "wf6ocs3j";

const UPLOAD_PRESET = "kts_members";



const requestRef =
collection(db, "memberRequests");



const form =
document.getElementById("memberRequestForm");


const requestName =
document.getElementById("requestName");


const requestMobile =
document.getElementById("requestMobile");


const requestBlood =
document.getElementById("requestBlood");


const requestPosition =
document.getElementById("requestPosition");


const requestPhoto =
document.getElementById("requestPhoto");


const choosePhotoBtn =
document.getElementById("choosePhotoBtn");


const photoName =
document.getElementById("photoName");


const previewBox =
document.getElementById("previewBox");


const photoPreview =
document.getElementById("photoPreview");


const submitRequestBtn =
document.getElementById("submitRequestBtn");


const requestMessage =
document.getElementById("requestMessage");



choosePhotoBtn.addEventListener(

"click",

() => {

requestPhoto.click();

}

);



requestPhoto.addEventListener(

"change",

() => {


const file =
requestPhoto.files[0];


if(!file){

photoName.textContent =
"কোনো ছবি নির্বাচন করা হয়নি";

previewBox.style.display =
"none";

return;

}


if(!file.type.startsWith("image/")){

alert("শুধু ছবি নির্বাচন করুন");

requestPhoto.value = "";

return;

}


if(file.size > 5 * 1024 * 1024){

alert("ছবি 5MB-এর কম হতে হবে");

requestPhoto.value = "";

return;

}


photoName.textContent =
file.name;


photoPreview.src =
URL.createObjectURL(file);


previewBox.style.display =
"block";


}

);



// CLOUDINARY

async function uploadPhoto(file){


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

method:"POST",

body:formData

}

);


const result =
await response.json();


if(!response.ok){

throw new Error(

result?.error?.message ||

"Photo Upload Failed"

);

}


return {

url:result.secure_url,

publicId:result.public_id

};


}



// SUBMIT

form.addEventListener(

"submit",

async(event) => {


event.preventDefault();


const name =
requestName.value.trim();


const mobile =
requestMobile.value.trim();


const bloodGroup =
requestBlood.value;


const position =
requestPosition.value;


const photoFile =
requestPhoto.files[0];



if(

!name ||
!mobile ||
!bloodGroup ||
!position ||
!photoFile

){

requestMessage.textContent =
"⚠️ সব তথ্য পূরণ করুন";

return;

}


try{


submitRequestBtn.disabled = true;


submitRequestBtn.textContent =
"📤 ছবি Upload হচ্ছে...";


const uploaded =
await uploadPhoto(photoFile);



submitRequestBtn.textContent =
"💾 আবেদন Save হচ্ছে...";



await addDoc(

requestRef,

{

name,

mobile,

bloodGroup,

position,

category:"general",

photo:uploaded.url,

photoPublicId:
uploaded.publicId,

status:"pending",

createdAt:
serverTimestamp()

}

);



form.reset();


photoName.textContent =
"কোনো ছবি নির্বাচন করা হয়নি";


previewBox.style.display =
"none";


requestMessage.textContent =
"✅ আবেদন সফল হয়েছে। Admin অনুমোদনের জন্য অপেক্ষা করুন।";


}

catch(error){


console.error(error);


requestMessage.textContent =

"❌ Submit হয়নি: " +
error.message;


}

finally{


submitRequestBtn.disabled =
false;


submitRequestBtn.textContent =
"📩 আবেদন Submit করুন";


}


}

);
