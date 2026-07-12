import { db } from "./firebase.js";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const programsRef = collection(db,"programs");
const categoriesRef = collection(db,"debitCategories");
const entriesRef = collection(db,"debitEntries");
const contractsRef = collection(db,"contracts");

let programs = [];
let categories = [];
let entries = [];
let contracts = [];

let editingContract = null;

function esc(v){
    return String(v ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;");
}

function money(v){
    return "₹"+Number(v||0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:2
        }
    );
}

function loadPrograms(){

    const opts =
        '<option value="">Program নির্বাচন করুন</option>' +

        programs
        .sort((a,b)=>Number(b.year)-Number(a.year))
        .map(p=>`

<option value="${p.id}">
${esc(p.name)} (${esc(p.year)})
</option>

`).join("");

    $("contractProgramFilter").innerHTML =
        '<option value="all">সব Program</option>' +

        programs.map(p=>`

<option value="${p.id}">
${esc(p.name)}
</option>

`).join("");

}

function loadCategories(programId){

    $("contractCategoryFilter").innerHTML =

    '<option value="all">সব Category</option>'+

    categories

    .filter(c=>c.programId===programId)

    .map(c=>`

<option value="${c.id}">
${esc(c.name)}
</option>

`).join("");

}

function loadExpenseEntries(programId,categoryId){

    const list = entries.filter(e=>{

        return (

            e.programId===programId &&

            e.categoryId===categoryId

        );

    });

    return list;

}
onSnapshot(programsRef,(snap)=>{

    programs =
        snap.docs.map(doc=>({

            id:doc.id,

            ...doc.data()

        }));

    loadPrograms();

});

onSnapshot(categoriesRef,(snap)=>{

    categories =
        snap.docs.map(doc=>({

            id:doc.id,

            ...doc.data()

        }));

});

onSnapshot(entriesRef,(snap)=>{

    entries =
        snap.docs.map(doc=>({

            id:doc.id,

            ...doc.data()

        }));

});
/* ==========================================
   CONTRACT FORM
========================================== */

const contractProgram = $("contractProgramFilter");
const contractCategory = $("contractCategoryFilter");

const contractName = $("contractName");
const contractAmount = $("contractAmount");
const contractDate = $("contractDate");
const contractNote = $("contractNote");

const saveContractBtn = $("saveContractBtn");


/* ==========================================
   PROGRAM CHANGE
========================================== */

contractProgram.addEventListener("change",()=>{

    loadCategories(contractProgram.value);

    renderExpenseDropdown();

});


/* ==========================================
   CATEGORY CHANGE
========================================== */

contractCategory.addEventListener("change",()=>{

    renderExpenseDropdown();

});


/* ==========================================
   EXPENSE ENTRY DROPDOWN
========================================== */

function renderExpenseDropdown(){

    let old = $("contractExpense");

    if(old){

        old.remove();

    }

    const select =
        document.createElement("select");

    select.id="contractExpense";

    select.innerHTML=
    '<option value="">Expense Entry নির্বাচন করুন</option>';

    const list =
        loadExpenseEntries(

            contractProgram.value,

            contractCategory.value

        );

    list.forEach(item=>{

        select.innerHTML+=`

<option value="${item.id}">
${item.name}
(${money(item.amount)})
</option>

`;

    });

    contractCategory.parentNode
        .appendChild(select);

}

/* ==========================================
   SAVE CONTRACT
========================================== */

saveContractBtn.addEventListener(

"click",

async()=>{

const expenseId=

$("contractExpense").value;

if(

!contractProgram.value ||

!contractCategory.value ||

!expenseId ||

!contractName.value ||

!contractAmount.value

){

alert("সব তথ্য পূরণ করুন");

return;

}

const payload={

programId:contractProgram.value,

categoryId:contractCategory.value,

expenseId,

contractor:contractName.value.trim(),

contractAmount:Number(contractAmount.value),

contractDate:contractDate.value,

note:contractNote.value.trim(),

createdAt:serverTimestamp()

};

try{

if(editingContract){

await updateDoc(

doc(

db,

"contracts",

editingContract

),

payload

);

editingContract=null;

}else{

await addDoc(

contractsRef,

payload

);

}

clearContractForm();

alert("Contract Save হয়েছে");

}catch(err){

console.error(err);

alert("Save করা যায়নি");

}

});

/* ==========================================
CLEAR FORM
========================================== */

function clearContractForm(){

contractName.value="";

contractAmount.value="";

contractDate.value="";

contractNote.value="";

$("contractExpense").selectedIndex=0;

}

/* ==========================================
   LIVE CONTRACT LIST
========================================== */

const contractList = $("contractList");

onSnapshot(
    query(
        contractsRef,
        orderBy("createdAt", "desc")
    ),
    (snap) => {

        contracts = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderContracts();

    }
);

function renderContracts() {

    if (!contracts.length) {

        contractList.innerHTML = `
        <p style="text-align:center;padding:25px">
            কোনো Contractor পাওয়া যায়নি।
        </p>`;
        return;

    }

    contractList.innerHTML = contracts.map(c => {

        const paid = getPaidAmount(c.expenseId);

        const due = Math.max(
            Number(c.contractAmount || 0) - paid,
            0
        );

        let status = "🔴 Pending";

        if (paid > 0) status = "🟡 Partial";

        if (due === 0) status = "🟢 Completed";

        return `

<div class="contract-card">

<div class="contract-card-top">

<div>

<div class="contract-name">
${esc(c.contractor)}
</div>

<div>
${status}
</div>

</div>

<div class="contract-amount">
${money(c.contractAmount)}
</div>

</div>

<div class="contract-summary">

<div>

<b>Paid</b><br>

${money(paid)}

</div>

<div>

<b>Due</b><br>

${money(due)}

</div>

<div>

<b>Date</b><br>

${esc(c.contractDate || "-")}

</div>

</div>

<div class="contract-action">

<button
class="contract-edit"
data-edit="${c.id}">

✏ Edit

</button>

<button
class="contract-delete"
data-delete="${c.id}">

🗑 Delete

</button>

</div>

</div>

`;

    }).join("");

    bindContractButtons();

}

function getPaidAmount(expenseId){

    return entries

    .filter(e=>e.id===expenseId)

    .reduce(

        (sum,e)=>

        sum+Number(e.amount||0),

        0

    );

}

function bindContractButtons(){

document
.querySelectorAll("[data-edit]")
.forEach(btn=>{

btn.onclick=()=>{

const item=

contracts.find(

x=>x.id===

btn.dataset.edit

);

if(!item) return;

editingContract=item.id;

contractProgram.value=item.programId;

loadCategories(item.programId);

renderExpenseDropdown();

setTimeout(()=>{

$("contractExpense").value=item.expenseId;

},100);

contractName.value=item.contractor;

contractAmount.value=item.contractAmount;

contractDate.value=item.contractDate;

contractNote.value=item.note||"";

};

});

document
.querySelectorAll("[data-delete]")
.forEach(btn=>{

btn.onclick=async()=>{

if(!confirm("Delete করবেন?")) return;

await deleteDoc(

doc(

db,

"contracts",

btn.dataset.delete

)

);

};

});

}
