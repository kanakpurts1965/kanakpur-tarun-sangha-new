import { db } from "./firebase.js";


import {

collection,
onSnapshot,
deleteDoc,
doc,
addDoc,
getDocs,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";



const requestRef =
collection(db, "memberRequests");


const membersRef =
collection(db, "members");



// ADMIN MEMBER AREA-এর আগে REQUEST BOX তৈরি

const adminMemberList =
document.getElementById("adminMemberList");


const requestSection =
document.createElement("div");


requestSection.className =
"member-request-section";


requestSection.innerHTML = `

<h2>
📩 Member Requests
</h2>

<p>
নতুন সদস্য আবেদন অনুমোদন অথবা বাতিল করুন
</p>

<div id="memberRequestList">

Loading...

</div>

`;


if(adminMemberList){

adminMemberList
.parentElement
.insertBefore(

requestSection,

adminMemberList

);

}



const memberRequestList =
document.getElementById(
"memberRequestList"
);



// NEXT SERIAL

async function getNextSerial(){


const snapshot =
await getDocs(membersRef);


let maxSerial = 0;


snapshot.forEach((item) => {


const serial =
Number(item.data().serial) || 0;


if(serial > maxSerial){

maxSerial = serial;

}


});


return maxSerial + 1;

}



// REQUEST LOAD

onSnapshot(

requestRef,

(snapshot) => {


if(!memberRequestList) return;


memberRequestList.innerHTML = "";


if(snapshot.empty){


memberRequestList.innerHTML = `

<p style="padding:20px;text-align:center">

কোনো নতুন Member Request নেই।

</p>

`;


return;

}



snapshot.forEach((item) => {


const data =
item.data();


const card =
document.createElement("div");


card.className =
"member-request-card";


card.innerHTML = `


<img

src="${data.photo || "member.png"}"

class="request-photo"

alt="Member Photo"

>


<div class="request-info">


<h3>
${safe(data.name)}
</h3>


<p>
📞 ${safe(data.mobile)}
</p>


<p>
🩸 ${safe(data.bloodGroup)}
&nbsp;&nbsp;
👔 ${safe(data.position)}
</p>


<div class="request-actions">


<button
class="approve-request"
data-id="${item.id}"
>

✅ Approve

</button>


<button
class="reject-request"
data-id="${item.id}"
>

❌ Reject

</button>


</div>


</div>

`;


card._requestData = {

id:item.id,

...data

};


memberRequestList.appendChild(card);


});


}

);



// APPROVE + REJECT

document.addEventListener(

"click",

async(event) => {



// APPROVE

const approveBtn =
event.target.closest(
".approve-request"
);


if(approveBtn){


const card =
approveBtn.closest(
".member-request-card"
);


const data =
card._requestData;


if(

!confirm(

`${data.name} কে সদস্য হিসেবে Approve করবেন?`

)

){

return;

}


try{


approveBtn.disabled = true;


approveBtn.textContent =
"⏳ Approving...";


const serial =
await getNextSerial();



await addDoc(

membersRef,

{

name:data.name || "",

mobile:data.mobile || "",

bloodGroup:
data.bloodGroup || "",

position:
data.position || "General Member",

category:"general",

photo:data.photo || "",

photoPublicId:
data.photoPublicId || "",

serial,

createdAt:
serverTimestamp()

}

);



await deleteDoc(

doc(

db,

"memberRequests",

data.id

)

);


alert(

"✅ Member Approve হয়েছে"

);


}

catch(error){


console.error(error);


approveBtn.disabled = false;


approveBtn.textContent =
"✅ Approve";


alert(

"❌ Approve হয়নি: " +
error.message

);


}


return;

}



// REJECT

const rejectBtn =
event.target.closest(
".reject-request"
);


if(rejectBtn){


const card =
rejectBtn.closest(
".member-request-card"
);


const data =
card._requestData;


if(

!confirm(

`${data.name}-এর আবেদন Reject করবেন?`

)

){

return;

}


try{


rejectBtn.disabled = true;


await deleteDoc(

doc(

db,

"memberRequests",

data.id

)

);


alert(

"✅ Request Reject হয়েছে"

);


}

catch(error){


console.error(error);


rejectBtn.disabled = false;


alert(

"❌ Reject হয়নি"

);


}


}


}

);



// SAFE TEXT

function safe(value = ""){


return String(value)

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");


}
