import { db } from "./firebase.js";

import {
collection,
doc,
addDoc,
updateDoc,
deleteDoc,
onSnapshot,
query,
orderBy,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const contractRef = collection(db,"contracts");
const programRef = collection(db,"programs");
const debitCategoryRef = collection(db,"debitCategories");
const debitEntryRef = collection(db,"debitEntries");

let allPrograms=[];
let allCategories=[];
let allEntries=[];
let allContracts=[];

let editId=null;

const contractYear=document.getElementById("contractYear");
const contractProgram=document.getElementById("contractProgram");
const contractCategory=document.getElementById("contractCategory");

const contractName=document.getElementById("contractName");
const contractAmount=document.getElementById("contractAmount");
const contractDate=document.getElementById("contractDate");
const contractNote=document.getElementById("contractNote");

const saveContractBtn=document.getElementById("saveContractBtn");
const contractList=document.getElementById("contractList");

function taka(v){

return Number(v||0).toLocaleString("en-IN");

}

onSnapshot(

query(programRef,orderBy("year","desc")),

(snapshot)=>{

allPrograms=[];

snapshot.forEach(doc=>{

allPrograms.push({

id:doc.id,

...doc.data()

});

});

loadYears();

loadPrograms();

}

);

onSnapshot(

debitCategoryRef,

(snapshot)=>{

allCategories=[];

snapshot.forEach(doc=>{

allCategories.push({

id:doc.id,

...doc.data()

});

});

}

);

onSnapshot(

debitEntryRef,

(snapshot)=>{

allEntries=[];

snapshot.forEach(doc=>{

allEntries.push({

id:doc.id,

...doc.data()

});

});

}

);

onSnapshot(

contractRef,

(snapshot)=>{

allContracts=[];

snapshot.forEach(doc=>{

allContracts.push({

id:doc.id,

...doc.data()

});

});

renderContractList();

}

);
/* ==========================================
   YEAR LOAD
========================================== */

function loadYears(){

const years=[...new Set(

allPrograms.map(p=>String(p.year))

)];

years.sort().reverse();

contractYear.innerHTML=

'<option value="">বছর নির্বাচন করুন</option>';

years.forEach(y=>{

contractYear.innerHTML+=`

<option value="${y}">
${y}
</option>

`;

});

}


/* ==========================================
PROGRAM LOAD
========================================== */

function loadPrograms(){

const year=contractYear.value;

contractProgram.innerHTML=

'<option value="">Program নির্বাচন করুন</option>';

allPrograms

.filter(p=>{

if(!year) return true;

return String(p.year)===year;

})

.forEach(p=>{

contractProgram.innerHTML+=`

<option value="${p.id}">
${p.name}
</option>

`;

});

loadCategories();

}


/* ==========================================
CATEGORY LOAD
========================================== */

function loadCategories(){

const pid=contractProgram.value;

contractCategory.innerHTML=

'<option value="">Category নির্বাচন করুন</option>';

allCategories

.filter(c=>c.programId===pid)

.forEach(c=>{

contractCategory.innerHTML+=`

<option value="${c.id}">
${c.name}
</option>

`;

});

}


/* ==========================================
CHANGE EVENT
========================================== */

contractYear.addEventListener(

"change",

loadPrograms

);

contractProgram.addEventListener(

"change",

loadCategories

);

/* ==========================================
SAVE CONTRACT
========================================== */

saveContractBtn.onclick=async()=>{

if(

!contractYear.value||

!contractProgram.value||

!contractCategory.value||

!contractName.value||

!contractAmount.value

){

alert("সব তথ্য পূরণ করুন");

return;

}

const data={

year:contractYear.value,

programId:contractProgram.value,

categoryId:contractCategory.value,

contractor:contractName.value.trim(),

contractAmount:Number(contractAmount.value),

contractDate:contractDate.value,

note:contractNote.value.trim(),

createdAt:serverTimestamp()

};

if(editId){

await updateDoc(

doc(db,"contracts",editId),

data

);

editId=null;

}else{

await addDoc(

contractRef,

data

);

}

contractName.value="";

contractAmount.value="";

contractDate.value="";

contractNote.value="";

alert("Contract Save হয়েছে");

};
