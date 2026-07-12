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


/* ===============================
   FIRESTORE COLLECTION
================================ */

const contractRef = collection(db, "contracts");
const programRef = collection(db, "programs");
const categoryRef = collection(db, "debitCategories");
const debitRef = collection(db, "debitEntries");


/* ===============================
   GLOBAL DATA
================================ */

let programs = [];
let categories = [];
let debits = [];
let contracts = [];

let editId = null;


/* ===============================
   ELEMENTS
================================ */

const year = document.getElementById("contractYear");

const program = document.getElementById("contractProgram");

const category = document.getElementById("contractCategory");

const contractor = document.getElementById("contractName");

const amount = document.getElementById("contractAmount");

const date = document.getElementById("contractDate");

const note = document.getElementById("contractNote");

const saveBtn = document.getElementById("saveContractBtn");

const list = document.getElementById("contractList");

const searchBox =
document.getElementById("contractSearch");


/* ===============================
   MONEY FORMAT
================================ */

function money(value){

return Number(

value || 0

).toLocaleString(

"en-IN"

);

}

/* =====================================
   LOAD PROGRAMS
===================================== */

function loadPrograms() {

    onSnapshot(

        query(

            programRef,

            orderBy("year", "desc")

        ),

        (snapshot) => {

            programs = [];

            snapshot.forEach((doc) => {

                programs.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            loadYears();

        }

    );

}


/* =====================================
   LOAD YEARS
===================================== */

function loadYears() {

    const years = [

        ...new Set(

            programs.map(

                p => String(p.year)

            )

        )

    ];

    years.sort().reverse();

    year.innerHTML =

        `<option value="">বছর নির্বাচন করুন</option>`;

    years.forEach((y) => {

        year.innerHTML += `

        <option value="${y}">

            ${y}

        </option>

        `;

    });

    loadProgramDropdown();

}


/* =====================================
   PROGRAM DROPDOWN
===================================== */

function loadProgramDropdown() {

    program.innerHTML =

        `<option value="">Program নির্বাচন করুন</option>`;

    programs

        .filter((item) => {

            if (!year.value) return true;

            return String(item.year) === year.value;

        })

        .forEach((item) => {

            program.innerHTML += `

            <option value="${item.id}">

                ${item.name}

            </option>

            `;

        });

}

/* =====================================
   LOAD CATEGORIES
===================================== */

function loadCategories() {

    onSnapshot(

        categoryRef,

        (snapshot) => {

            categories = [];

            snapshot.forEach((doc) => {

                categories.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            fillCategoryDropdown();

        }

    );

}


/* =====================================
   CATEGORY DROPDOWN
===================================== */

function fillCategoryDropdown() {

    category.innerHTML =

        `<option value="">Category নির্বাচন করুন</option>`;

    categories

        .filter((item) => {

            return item.programId === program.value;

        })

        .forEach((item) => {

            category.innerHTML += `

            <option value="${item.id}">

                ${item.name}

            </option>

            `;

        });

}


/* =====================================
   YEAR CHANGE
===================================== */

year.addEventListener(

    "change",

    () => {

        loadProgramDropdown();

        fillCategoryDropdown();

        renderContracts();

    }

);


/* =====================================
   PROGRAM CHANGE
===================================== */

program.addEventListener(

    "change",

    () => {

        fillCategoryDropdown();

        renderContracts();

    }

);


/* =====================================
   CATEGORY CHANGE
===================================== */

category.addEventListener(

    "change",

    () => {

        renderContracts();

    }

);


/* =====================================
   INITIAL LOAD
===================================== */

loadPrograms();

loadCategories();

/* =====================================
   SAVE CONTRACT
===================================== */


/* =====================================
   LOAD DEBIT ENTRIES
===================================== */

function loadDebitEntries() {

    onSnapshot(

        debitRef,

        (snapshot) => {

            debits = [];

            snapshot.forEach((doc) => {

                debits.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            renderContracts();

        }

    );

}


/* =====================================
   LOAD CONTRACTS
===================================== */

function loadContracts() {

    onSnapshot(

        query(

            contractRef,

            orderBy("createdAt", "desc")

        ),

        (snapshot) => {

            contracts = [];

            snapshot.forEach((doc) => {

                contracts.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            renderContracts();

        }

    );

}


/* =====================================
   START FIRESTORE
===================================== */

loadDebitEntries();

loadContracts();


/* =====================================
   GET TOTAL PAID
===================================== */

function getPaid(categoryId){

    let total = 0;

    debits
        .filter(item => item.categoryId === categoryId)
        .forEach(item => {

            total += Number(item.amount || 0);

        });

    return total;

}


/* =====================================
   GET DUE
===================================== */

function getDue(contract){

    return Math.max(

        Number(contract.contractAmount || 0)

        -

        getPaid(contract.categoryId),

        0

    );

}


/* =====================================
   FILTER CONTRACT
===================================== */

function filteredContracts(){

    return contracts.filter(item=>{

        if(

            year.value &&

            item.year != year.value

        ){

            return false;

        }

        if(

            program.value &&

            item.programId != program.value

        ){

            return false;

        }

        if(

            category.value &&

            item.categoryId != category.value

        ){

            return false;

        }

        if(

            searchBox &&

            searchBox.value.trim() !== ""

        ){

            const txt =

            searchBox.value

            .toLowerCase();

            if(

                !item.contractor

                .toLowerCase()

                .includes(txt)

            ){

                return false;

            }

        }

        return true;

    });

}

/* =====================================
   RENDER CONTRACT LIST
===================================== */

function renderContracts(){

    if(!list) return;

    const data = filteredContracts();

    if(data.length === 0){

        list.innerHTML = `
            <div class="empty-state">
                <h3>কোনো Contractor পাওয়া যায়নি</h3>
            </div>
        `;

        updateSummary();

        return;

    }

    let html = "";

    data.forEach(item=>{

        const paid = getPaid(item.categoryId);

        const due = getDue(item);

        const p = programs.find(
            x=>x.id===item.programId
        );

        const c = categories.find(
            x=>x.id===item.categoryId
        );

        let status = "🔴 Pending";

        if(paid>0){

            status="🟡 Partial";

        }

        if(due===0){

            status="🟢 Completed";

        }

        html += `

<div class="contract-card">

<div class="contract-card-header">

<h3>

${item.contractor}

</h3>

<span>

${status}

</span>

</div>

<p>

<b>Program :</b>

${p ? p.name : "-"}

</p>

<p>

<b>Category :</b>

${c ? c.name : "-"}

</p>

<p>

<b>Contract :</b>

₹${money(item.contractAmount)}

</p>

<p>

<b>Paid :</b>

₹${money(paid)}

</p>

<p>

<b>Due :</b>

₹${money(due)}

</p>

<p>

<b>Date :</b>

${item.contractDate || "-"}

</p>

`;

        if(item.note){

            html += `

<p>

<b>Note :</b>

${item.note}

</p>

`;

        }

        html += `

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

    list.innerHTML = html;

    bindContractButtons();

    updateSummary();

}

/* =====================================
   EDIT + DELETE BUTTON
===================================== */

function bindContractButtons(){

    document
    .querySelectorAll(".contract-edit")
    .forEach(btn=>{

        btn.onclick=()=>{

            const item=contracts.find(

                x=>x.id===btn.dataset.id

            );

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


    document
    .querySelectorAll(".contract-delete")
    .forEach(btn=>{

        btn.onclick=async()=>{

            const ok=confirm(

                "এই Contractor Delete করবেন?"

            );

            if(!ok) return;

            try{

                await deleteDoc(

                    doc(

                        db,

                        "contracts",

                        btn.dataset.id

                    )

                );

                alert("Delete সফল হয়েছে");

            }

            catch(err){

                console.error(err);

                alert("Delete Failed");

            }

        };

    });

}

/* =====================================
   SUMMARY CARD
===================================== */

const summaryContract =
document.getElementById("summaryContract");

const summaryPaid =
document.getElementById("summaryPaid");

const summaryDue =
document.getElementById("summaryDue");


function updateSummary(){

    let totalContract = 0;
    let totalPaid = 0;
    let totalDue = 0;

    filteredContracts().forEach(item=>{

        const paid = getPaid(item.categoryId);

        const due = getDue(item);

        totalContract += Number(item.contractAmount || 0);

        totalPaid += paid;

        totalDue += due;

    });

    if(summaryContract){

        summaryContract.innerText =
        "₹" + money(totalContract);

    }

    if(summaryPaid){

        summaryPaid.innerText =
        "₹" + money(totalPaid);

    }

    if(summaryDue){

        summaryDue.innerText =
        "₹" + money(totalDue);

    }

}
/* =====================================
   SEARCH CONTRACTOR
===================================== */

if(searchBox){

    searchBox.addEventListener(

        "keyup",

        ()=>{

            renderContracts();

        }

    );

}


/* =====================================
   RESET FORM
===================================== */

function resetContractForm(){

    editId = null;

    contractor.value = "";

    amount.value = "";

    date.value = "";

    note.value = "";

    year.selectedIndex = 0;

    loadProgramDropdown();

    category.innerHTML =

    `<option value="">Category নির্বাচন করুন</option>`;

}


/* =====================================
   CANCEL EDIT
===================================== */

const cancelBtn =

document.getElementById("cancelContractBtn");

if(cancelBtn){

cancelBtn.onclick=()=>{

resetContractForm();

};

}


/* =====================================
   REFRESH AFTER SAVE
===================================== */

function refreshContractPage(){

    renderContracts();

    updateSummary();

}

/* =====================================
   EXPORT DATA FOR PDF
===================================== */

function getContractReportData(){

    return filteredContracts().map(item=>{

        const programName =
        programs.find(
            p=>p.id===item.programId
        )?.name || "-";

        const categoryName =
        categories.find(
            c=>c.id===item.categoryId
        )?.name || "-";

        const paid =
        getPaid(item.categoryId);

        const due =
        getDue(item);

        return{

            contractor:
            item.contractor,

            program:
            programName,

            category:
            categoryName,

            contract:
            Number(
                item.contractAmount||0
            ),

            paid:
            paid,

            due:
            due,

            date:
            item.contractDate||"",

            note:
            item.note||""

        };

    });

}


/* =====================================
   TOTAL COUNT
===================================== */

function getTotalContractCount(){

    return filteredContracts().length;

}


/* =====================================
   TOTAL AMOUNT
===================================== */

function getTotalContractAmount(){

    return filteredContracts()

    .reduce(

        (sum,item)=>{

            return sum+

            Number(

                item.contractAmount||0

            );

        },

        0

    );

}
/* =====================================
   CONTRACT STATUS
===================================== */

function getContractStatus(item){

    const paid = getPaid(item.categoryId);

    const due = getDue(item);

    if(paid<=0){

        return{

            text:"Pending",

            color:"#e53935"

        };

    }

    if(due<=0){

        return{

            text:"Completed",

            color:"#43a047"

        };

    }

    return{

        text:"Partial",

        color:"#fb8c00"

    };

}


/* =====================================
   CONTRACT CARD COLOR
===================================== */

function getStatusBadge(item){

    const status =

    getContractStatus(item);

    return `

<span
class="contract-status"

style="background:${status.color}">

${status.text}

</span>

`;

}


/* =====================================
   LAST UPDATE
===================================== */

function getLastUpdate(item){

    if(

        item.updatedAt

    ){

        return item.updatedAt;

    }

    return item.createdAt || "";

}
/* =====================================
   FILTER SUMMARY
===================================== */

function getFilterInfo(){

    return{

        year: year.value || "All",

        program:

        program.options[
            program.selectedIndex
        ]?.text || "All",

        category:

        category.options[
            category.selectedIndex
        ]?.text || "All"

    };

}


/* =====================================
   CLEAR FILTER
===================================== */

function clearFilters(){

    year.selectedIndex=0;

    loadProgramDropdown();

    program.selectedIndex=0;

    fillCategoryDropdown();

    category.selectedIndex=0;

    if(searchBox){

        searchBox.value="";

    }

    renderContracts();

}


/* =====================================
   FILTER BUTTON
===================================== */

const clearFilterBtn=

document.getElementById(

"clearContractFilterBtn"

);

if(clearFilterBtn){

clearFilterBtn.onclick=()=>{

clearFilters();

};

}


/* =====================================
   AUTO REFRESH
===================================== */

year.addEventListener(

"change",

refreshContractPage

);

program.addEventListener(

"change",

refreshContractPage

);

category.addEventListener(

"change",

refreshContractPage

);

if(searchBox){

searchBox.addEventListener(

"input",

refreshContractPage

);

}

/* =====================================
   VALIDATION
===================================== */

function validateContractForm(){

    if(!year.value){

        alert("বছর নির্বাচন করুন");

        year.focus();

        return false;

    }

    if(!program.value){

        alert("Program নির্বাচন করুন");

        program.focus();

        return false;

    }

    if(!category.value){

        alert("Category নির্বাচন করুন");

        category.focus();

        return false;

    }

    if(contractor.value.trim()==""){

        alert("Contractor Name লিখুন");

        contractor.focus();

        return false;

    }

    if(Number(amount.value)<=0){

        alert("Contract Amount লিখুন");

        amount.focus();

        return false;

    }

    return true;

}


/* =====================================
   FIND PROGRAM NAME
===================================== */

function getProgramName(id){

    const item=

    programs.find(

        x=>x.id===id

    );

    return item ? item.name : "-";

}


/* =====================================
   FIND CATEGORY NAME
===================================== */

function getCategoryName(id){

    const item=

    categories.find(

        x=>x.id===id

    );

    return item ? item.name : "-";

}


/* =====================================
   FIND CONTRACT
===================================== */

function findContract(id){

    return contracts.find(

        x=>x.id===id

    );

}
/* =====================================
   DUPLICATE CONTRACT CHECK
===================================== */

function isDuplicateContract(){

    const name = contractor.value.trim().toLowerCase();

    const exist = contracts.find(item=>{

        if(editId && item.id===editId){

            return false;

        }

        return (

            item.year===year.value &&

            item.programId===program.value &&

            item.categoryId===category.value &&

            item.contractor
            .trim()
            .toLowerCase()===name

        );

    });

    return exist || null;

}


/* =====================================
   SAVE VALIDATION
===================================== */

function canSaveContract(){

    if(!validateContractForm()){

        return false;

    }

    const duplicate =

    isDuplicateContract();

    if(duplicate){

        alert(

        "এই Contractor ইতিমধ্যেই আছে"

        );

        return false;

    }

    return true;

}


/* =====================================
   CONTRACT SERIAL
===================================== */

function contractSerial(){

    return "CT-"

    +

    Date.now()

    +

    "-"

    +

    Math.floor(

        Math.random()*999

    );

}


/* =====================================
   CREATE CONTRACT OBJECT
===================================== */

function buildContractData(){

    return{

        contractNo:

        contractSerial(),

        year:year.value,

        programId:program.value,

        categoryId:category.value,

        contractor:

        contractor.value.trim(),

        contractAmount:

        Number(amount.value),

        contractDate:

        date.value,

        note:

        note.value.trim(),

        createdAt:

        serverTimestamp()

    };

}
/* =====================================
   SAVE CONTRACT
===================================== */

async function saveContract(){

    if(!canSaveContract()){

        return;

    }

    const data = buildContractData();

    try{

        if(editId){

            delete data.contractNo;

            await updateDoc(

                doc(db,"contracts",editId),

                {

                    ...data,

                    updatedAt:serverTimestamp()

                }

            );

            alert("Contract Update হয়েছে");

        }

        else{

            await addDoc(

                contractRef,

                data

            );

            alert("Contract Save হয়েছে");

        }

        editId = null;

        resetContractForm();

    }

    catch(err){

        console.error(err);

        alert("Save Failed");

    }

}


/* =====================================
   SAVE BUTTON
===================================== */

saveBtn.onclick = ()=>{

    saveContract();

};


/* =====================================
   ENTER KEY SUPPORT
===================================== */

document

.querySelectorAll(

"#contractPage input,#contractPage textarea"

)

.forEach(el=>{

el.addEventListener(

"keydown",

(e)=>{

if(

e.key==="Enter" &&

e.target.tagName!=="TEXTAREA"

){

e.preventDefault();

saveContract();

}

}

);

});

/* =====================================
   CONTRACT STATISTICS
===================================== */

function getContractStatistics(){

    let totalContract = 0;
    let totalPaid = 0;
    let totalDue = 0;

    let pending = 0;
    let partial = 0;
    let completed = 0;

    filteredContracts().forEach(item=>{

        const paid = getPaid(item.categoryId);
        const due = getDue(item);

        totalContract += Number(item.contractAmount || 0);
        totalPaid += paid;
        totalDue += due;

        if(paid<=0){

            pending++;

        }
        else if(due<=0){

            completed++;

        }
        else{

            partial++;

        }

    });

    return{

        totalContract,
        totalPaid,
        totalDue,

        pending,
        partial,
        completed

    };

}


/* =====================================
   UPDATE DASHBOARD CARD
===================================== */

function refreshDashboardCards(){

    const s = getContractStatistics();

    if(summaryContract){

        summaryContract.innerHTML =
        "₹"+money(s.totalContract);

    }

    if(summaryPaid){

        summaryPaid.innerHTML =
        "₹"+money(s.totalPaid);

    }

    if(summaryDue){

        summaryDue.innerHTML =
        "₹"+money(s.totalDue);

    }

    const pendingCard =
    document.getElementById("pendingContract");

    const partialCard =
    document.getElementById("partialContract");

    const completeCard =
    document.getElementById("completedContract");

    if(pendingCard){

        pendingCard.innerHTML = s.pending;

    }

    if(partialCard){

        partialCard.innerHTML = s.partial;

    }

    if(completeCard){

        completeCard.innerHTML = s.completed;

    }

}

/* =====================================
   PDF REPORT DATA
===================================== */

function buildPdfData(){

    const rows = [];

    filteredContracts().forEach(item=>{

        const paid = getPaid(item.categoryId);

        const due = getDue(item);

        rows.push({

            contractor : item.contractor,

            program : getProgramName(

                item.programId

            ),

            category : getCategoryName(

                item.categoryId

            ),

            contract :

            Number(

                item.contractAmount || 0

            ),

            paid : paid,

            due : due,

            status :

            getContractStatus(item).text,

            date :

            item.contractDate || ""

        });

    });

    return rows;

}


/* =====================================
   EXPORT JSON
===================================== */

function exportContractJson(){

    const data =

    JSON.stringify(

        buildPdfData(),

        null,

        2

    );

    const blob =

    new Blob(

        [data],

        {

            type:"application/json"

        }

    );

    const url =

    URL.createObjectURL(blob);

    const a =

    document.createElement("a");

    a.href = url;

    a.download =

    "contract-report.json";

    a.click();

    URL.revokeObjectURL(url);

}


/* =====================================
   EXPORT BUTTON
===================================== */

const exportBtn =

document.getElementById(

"contractExportBtn"

);

if(exportBtn){

exportBtn.onclick=()=>{

exportContractJson();

};

}
/* =====================================
   INITIALIZE MODULE
===================================== */

function initContractModule(){

    loadPrograms();

    loadCategories();

    loadDebitEntries();

    loadContracts();

    if(searchBox){

        searchBox.addEventListener(

            "input",

            ()=>{

                renderContracts();

                refreshDashboardCards();

            }

        );

    }

}


/* =====================================
   AUTO REFRESH
===================================== */

function refreshAll(){

    renderContracts();

    refreshDashboardCards();

}


/* =====================================
   PAGE OPEN
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initContractModule();

    }

);


/* =====================================
   GLOBAL ACCESS
===================================== */

window.refreshContractPage = refreshAll;

window.exportContractJson = exportContractJson;

window.resetContractForm = resetContractForm;

window.saveContract = saveContract;


/* =====================================
   VERSION
===================================== */

console.log(

"KTS Contractor Module v1.0 Loaded"

);

/* =====================================
   FINAL REFRESH
===================================== */

function finalRefresh(){

    renderContracts();

    refreshDashboardCards();

}


/* =====================================
   RESET AFTER SAVE
===================================== */

function afterSave(){

    resetContractForm();

    finalRefresh();

}


/* =====================================
   WINDOW FUNCTIONS
===================================== */

window.contractModule={

    refresh:finalRefresh,

    reset:resetContractForm,

    save:saveContract,

    export:exportContractJson,

    statistics:getContractStatistics,

    report:getContractReportData

};


/* =====================================
   SAFETY
===================================== */

window.addEventListener(

"error",

(e)=>{

console.error(

"KTS CONTRACT ERROR :",

e.message

);

});


/* =====================================
   AUTO UPDATE
===================================== */

if(searchBox){

searchBox.addEventListener(

"input",

()=>{

finalRefresh();

});

}


/* =====================================
   READY
===================================== */

setTimeout(()=>{

finalRefresh();

},500);


/* =====================================
   LOADED
===================================== */

console.log(
"%cKTS Contractor Module Loaded",
"color:#0b8f3a;font-size:16px;font-weight:bold;"
);

console.log(
"Version : 1.0"
);

console.log(
"Designed & Developed by Tanmoy Adak"
);
