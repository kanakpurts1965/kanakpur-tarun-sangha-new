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
