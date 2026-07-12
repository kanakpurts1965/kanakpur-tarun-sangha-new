import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const contractRef = collection(db,"contracts");
const programRef = collection(db,"programs");
const categoryRef = collection(db,"debitCategories");
const debitRef = collection(db,"debitEntries");

let programs = [];
let categories = [];
let debits = [];
let contracts = [];

let editId = null;

const year = document.getElementById("contractYear");
const program = document.getElementById("contractProgram");
const category = document.getElementById("contractCategory");

const contractor = document.getElementById("contractName");
const amount = document.getElementById("contractAmount");
const date = document.getElementById("contractDate");
const note = document.getElementById("contractNote");

const saveBtn = document.getElementById("saveContractBtn");
const list = document.getElementById("contractList");

function money(v){
    return Number(v||0).toLocaleString("en-IN");
}
/* ===========================
   LOAD PROGRAMS
=========================== */

function loadPrograms(){

onSnapshot(

query(programRef,orderBy("year","desc")),

(snapshot)=>{

programs=[];

snapshot.forEach(doc=>{

programs.push({

id:doc.id,

...doc.data()

});

});

loadYears();

});

}


/* ===========================
   LOAD YEARS
=========================== */

function loadYears(){

const years=[

...new Set(

programs.map(x=>String(x.year))

)

];

years.sort().reverse();

year.innerHTML=

'<option value="">বছর নির্বাচন করুন</option>';

years.forEach(y=>{

year.innerHTML+=`

<option value="${y}">
${y}
</option>

`;

});

loadProgramDropdown();

}


/* ===========================
   PROGRAM DROPDOWN
=========================== */

function loadProgramDropdown(){

program.innerHTML=

'<option value="">Program নির্বাচন করুন</option>';

programs

.filter(p=>{

if(!year.value) return true;

return String(p.year)===year.value;

})

.forEach(p=>{

program.innerHTML+=`

<option value="${p.id}">
${p.name}
</option>

`;

});

}
/* ===========================
   LOAD CATEGORIES
=========================== */

function loadCategories(){

onSnapshot(

categoryRef,

(snapshot)=>{

categories=[];

snapshot.forEach(doc=>{

categories.push({

id:doc.id,

...doc.data()

});

});

fillCategoryDropdown();

});

}


/* ===========================
   CATEGORY DROPDOWN
=========================== */

function fillCategoryDropdown(){

category.innerHTML=

'<option value="">Category নির্বাচন করুন</option>';

categories

.filter(c=>c.programId===program.value)

.forEach(c=>{

category.innerHTML+=`

<option value="${c.id}">
${c.name}
</option>

`;

});

}


/* ===========================
   EVENTS
=========================== */

year.addEventListener("change",()=>{

loadProgramDropdown();

category.innerHTML=
'<option value="">Category নির্বাচন করুন</option>';

});

program.addEventListener("change",()=>{

fillCategoryDropdown();

});


/* ===========================
   START
=========================== */

loadPrograms();
loadCategories();
/* ===========================
   SAVE CONTRACT
=========================== */

saveBtn.addEventListener("click", async () => {

    if (
        !year.value ||
        !program.value ||
        !category.value ||
        !contractor.value.trim() ||
        !amount.value
    ) {
        alert("সব তথ্য পূরণ করুন");
        return;
    }

    const data = {

        year: year.value,

        programId: program.value,

        categoryId: category.value,

        contractor: contractor.value.trim(),

        contractAmount: Number(amount.value),

        contractDate: date.value,

        note: note.value.trim(),

        createdAt: serverTimestamp()

    };

    try{

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

        contractor.value="";
        amount.value="";
        date.value="";
        note.value="";

        alert("Contract Save হয়েছে");

    }catch(err){

        console.error(err);

        alert("Save Failed");

    }

});
/* ===========================
   LOAD CONTRACT LIST
=========================== */

function loadContracts(){

onSnapshot(

query(contractRef,orderBy("createdAt","desc")),

(snapshot)=>{

contracts=[];

snapshot.forEach(doc=>{

contracts.push({

id:doc.id,

...doc.data()

});

});

renderContracts();

});

}


/* ===========================
   PAID AMOUNT
=========================== */

function getPaid(categoryId){

let total=0;

debits

.filter(d=>d.categoryId===categoryId)

.forEach(d=>{

total+=Number(d.amount||0);

});

return total;

}


/* ===========================
   DUE AMOUNT
=========================== */

function getDue(item){

return Number(item.contractAmount||0)-

getPaid(item.categoryId);

}
/* ===========================
   LOAD DEBIT ENTRIES
=========================== */

onSnapshot(

debitRef,

(snapshot)=>{

debits=[];

snapshot.forEach(doc=>{

debits.push({

id:doc.id,

...doc.data()

});

});

renderContracts();

}

);

loadContracts();

/* ===========================
   RENDER CONTRACT LIST
=========================== */

function renderContracts(){

if(!list) return;

if(contracts.length===0){

list.innerHTML="<h3 style='text-align:center'>কোনো Contractor পাওয়া যায়নি</h3>";
  if(searchBox){

const txt=searchBox.value.toLowerCase();

if(

txt &&

!item.contractor.toLowerCase().includes(txt)

){

return false;

}

}

return;

}

let html="";

filteredContracts().forEach(item=>{

const paid=getPaid(item.categoryId);

const due=getDue(item);

const p=programs.find(x=>x.id===item.programId);

const c=categories.find(x=>x.id===item.categoryId);

let status="🔴 Pending";

if(paid>0) status="🟡 Partial";

if(due<=0) status="🟢 Completed";

html+=`

<div class="contract-card">

<div class="contract-card-top">

<div>

<div class="contract-name">

${item.contractor}

</div>

<div>

${p ? p.name : "-"}

</div>

<div>

${c ? c.name : "-"}

</div>

</div>

<div class="contract-amount">

₹${money(item.contractAmount)}

</div>

</div>

<div class="contract-summary">

<div>

<b>Contract</b>

<br>

₹${money(item.contractAmount)}

</div>

<div>

<b>Paid</b>

<br>

₹${money(paid)}

</div>

<div>

<b>Due</b>

<br>

₹${money(due)}

</div>

</div>

<div style="margin-top:12px;font-weight:bold">

${status}

</div>

<div class="contract-action">

<button

class="contract-edit"

data-id="${item.id}"

>

✏ Edit

</button>

<button

class="contract-delete"

data-id="${item.id}"

>

🗑 Delete

</button>

</div>

</div>

`;

});

list.innerHTML=html;

bindContractButtons();
  updateSummary();

}
const percent=

item.contractAmount==0

?0

:Math.round(

(getPaid(item.categoryId)/item.contractAmount)

*100

);
/* ===========================
   EDIT + DELETE
=========================== */

function bindContractButtons(){

document.querySelectorAll(".contract-edit").forEach(btn=>{

btn.onclick=()=>{

const item=contracts.find(x=>x.id===btn.dataset.id);

if(!item) return;

editId=item.id;

year.value=item.year;

loadProgramDropdown();

setTimeout(()=>{

program.value=item.programId;

fillCategoryDropdown();

setTimeout(()=>{

category.value=item.categoryId;

},100);

},100);

contractor.value=item.contractor;
amount.value=item.contractAmount;
date.value=item.contractDate || "";
note.value=item.note || "";

window.scrollTo({

top:0,

behavior:"smooth"

});

};

});

document.querySelectorAll(".contract-delete").forEach(btn=>{

btn.onclick=async()=>{

if(!confirm("এই Contractor Delete করবেন?")) return;

try{

await deleteDoc(

doc(db,"contracts",btn.dataset.id)

);

alert("Delete সফল হয়েছে");

}catch(err){

console.error(err);

alert("Delete Failed");

}

};

});

}
/* ===========================
   SEARCH
=========================== */

const search=document.getElementById("contractSearch");

if(search){

search.addEventListener("input",()=>{

const txt=search.value.toLowerCase();

document.querySelectorAll(".contract-card").forEach(card=>{

card.style.display=

card.innerText.toLowerCase().includes(txt)

? ""

: "none";

});

});

}


/* ===========================
   SUMMARY
=========================== */

function updateSummary(){

let totalContract=0;
let totalPaid=0;
let totalDue=0;

contracts.forEach(item=>{

const paid=getPaid(item.categoryId);

const due=getDue(item);

totalContract+=Number(item.contractAmount||0);
totalPaid+=paid;
totalDue+=due;

});

console.log("Contract :",totalContract);
console.log("Paid :",totalPaid);
console.log("Due :",totalDue);

}


/* ===========================
   REFRESH
=========================== */

const oldRender=renderContracts;

renderContracts=function(){

oldRender();

updateSummary();

};
/* ===========================
SUMMARY CARD
=========================== */

const summaryBox=document.createElement("div");

summaryBox.className="contract-summary-top";

const page=document.querySelector("#contractPage .admin-box:last-child");

page.parentNode.insertBefore(summaryBox,page);

function updateSummary(){

let totalContract=0;
let totalPaid=0;
let totalDue=0;

contracts.forEach(c=>{

const paid=getPaid(c.categoryId);
const due=getDue(c);

totalContract+=Number(c.contractAmount||0);
totalPaid+=paid;
totalDue+=due;

});

summaryBox.innerHTML=`

<div class="contract-summary">

<div>

<h3>₹${money(totalContract)}</h3>

<p>Total Contract</p>

</div>

<div>

<h3>₹${money(totalPaid)}</h3>

<p>Total Paid</p>

</div>

<div>

<h3>₹${money(totalDue)}</h3>

<p>Total Due</p>

</div>

</div>

`;

}
/* ===========================
YEAR FILTER
=========================== */

contractYear.addEventListener("change",()=>{

renderContracts();

});

function filteredContracts(){

return contracts.filter(item=>{

if(

contractYear.value &&

item.year!=contractYear.value

){

return false;

}

if(

contractProgram.value &&

item.programId!=contractProgram.value

){

return false;

}

if(

contractCategory.value &&

item.categoryId!=contractCategory.value

){

return false;

}

return true;

});

}
/* ===========================
PROGRAM FILTER
=========================== */

contractProgram.addEventListener("change",()=>{

fillCategoryDropdown();

renderContracts();

});


/* ===========================
CATEGORY FILTER
=========================== */

contractCategory.addEventListener("change",()=>{

renderContracts();

});


/* ===========================
SEARCH FILTER
=========================== */

const searchBox=document.getElementById("contractSearch");

if(searchBox){

searchBox.addEventListener("input",()=>{

renderContracts();

});

}
