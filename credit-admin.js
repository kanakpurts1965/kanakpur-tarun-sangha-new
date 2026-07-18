import { db } from "./firebase.js";

import {
collection,
addDoc,
updateDoc,
deleteDoc,
doc,
onSnapshot,
serverTimestamp,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
const $=id=>document.getElementById(id);
console.log("DB =", db);
const programsRef=collection(db,"programs"), categoriesRef=collection(db,"creditCategories"), entriesRef=collection(db,"creditEntries");
let programs=[],categories=[],entries=[],editingId=null,categoryFilter="all",searchText="";

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function money(v){return "₹"+Number(v||0).toLocaleString("en-IN",{maximumFractionDigits:2})}

function fillPrograms(){
 const opts='<option value="">Program নির্বাচন করুন</option>'+programs.sort((a,b)=>Number(b.year)-Number(a.year)).map(p=>`<option value="${p.id}">${esc(p.name)} (${esc(p.year)})</option>`).join("");
 const a=$("creditProgramSelect").value,b=$("entryProgramSelect").value;
 $("creditProgramSelect").innerHTML=opts;$("entryProgramSelect").innerHTML=opts;
 $("creditProgramSelect").value=a;$("entryProgramSelect").value=b;
 const old=$("creditYearFilter").value;
 const ys=[...new Set(programs.map(p=>Number(p.year)).filter(Boolean))].sort((a,b)=>b-a);
 $("creditYearFilter").innerHTML='<option value="all">সব বছর</option>'+ys.map(y=>`<option value="${y}">${y}</option>`).join("");
 if(old==="all"||ys.includes(Number(old))) $("creditYearFilter").value=old;
}

function fillCreditProgramFilter(){
 const year=$("creditYearFilter").value;
 const old=$("creditProgramFilter").value;
 const visible=programs.filter(p=>year==="all"||String(p.year)===year);
 $("creditProgramFilter").innerHTML='<option value="all">সব Program</option>'+
 visible.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
 $("creditProgramFilter").value=visible.some(p=>p.id===old)?old:"all";
}
function fillCategories(){
 const pid=$("entryProgramSelect").value;
 $("entryCategorySelect").innerHTML='<option value="">Category নির্বাচন করুন</option>'+categories.filter(c=>c.programId===pid).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
}
$("entryProgramSelect")?.addEventListener("change",fillCategories);

function renderCategoryChips(){
 const current=categoryFilter;
 const year=$("creditYearFilter").value;
 const selectedProgram=$("creditProgramFilter").value;
 const allowedProgramIds=new Set(
   programs.filter(p=>(year==="all"||String(p.year)===year)&&(selectedProgram==="all"||p.id===selectedProgram)).map(p=>p.id)
 );
 const visibleCategories=categories.filter(c=>allowedProgramIds.has(c.programId));
 if(current!=="all"&&!visibleCategories.some(c=>c.id===current)) categoryFilter="all";
 $("creditCategoryScroll").innerHTML=
  `<button type="button" class="credit-category-chip ${categoryFilter==="all"?"active":""}" data-category-filter="all">সব Category</button>`+
  visibleCategories.map(c=>`<button type="button" class="credit-category-chip ${categoryFilter===c.id?"active":""}" data-category-filter="${c.id}">${esc(c.name)}</button>`).join("");
}
$("creditCategoryScroll")?.addEventListener("click",e=>{
 const b=e.target.closest("[data-category-filter]"); if(!b)return;
 categoryFilter=b.dataset.categoryFilter; renderCategoryChips(); render();
});
$("creditSearchInput")?.addEventListener("input",e=>{
 searchText=e.target.value.trim().toLowerCase(); render();
});


$("saveCreditCategoryBtn")?.addEventListener("click",async()=>{
 const programId=$("creditProgramSelect").value,name=$("creditCategoryName").value.trim();
 if(!programId||!name){$("creditCategoryStatus").textContent="⚠️ Program ও Category Name দিন।";return}
 const duplicate=categories.some(c=>c.programId===programId&&String(c.name).toLowerCase()===name.toLowerCase());
 if(duplicate){$("creditCategoryStatus").textContent="⚠️ এই Category আগে থেকেই আছে।";return}
 try{await addDoc(categoriesRef,{programId,name,createdAt:serverTimestamp()});$("creditCategoryName").value="";$("creditCategoryStatus").textContent="✅ Category Save হয়েছে।"}catch(e){$("creditCategoryStatus").textContent="❌ "+e.message}
});

function resetEntry(){
 editingId=null;$("creditEntryName").value="";$("creditEntryAmount").value="";$("creditEntryDate").value="";$("creditEntryNote").value="";$("creditEntryHighlight").checked=false;
 $("saveCreditEntryBtn").textContent="💾 Entry Save করুন";$("cancelCreditEditBtn").style.display="none";
}
$("cancelCreditEditBtn")?.addEventListener("click",resetEntry);

let creditSaveInProgress=false;

async function saveCreditEntryOnce(){
 if(creditSaveInProgress) return;

 const saveButton=$("saveCreditEntryBtn");
 const entryData={
   programId:$("entryProgramSelect").value,
   categoryId:$("entryCategorySelect").value,
   name:$("creditEntryName").value.trim(),
   amount:Number($("creditEntryAmount").value),
   date:$("creditEntryDate").value,
   note:$("creditEntryNote").value.trim(),
   highlight:$("creditEntryHighlight").checked,
   updatedAt:serverTimestamp()
 };

 if(!entryData.programId||!entryData.categoryId||!entryData.name||!(entryData.amount>0)){
   $("creditEntryStatus").textContent="⚠️ Program, Category, Name এবং সঠিক Amount দিন।";
   return;
 }

 creditSaveInProgress=true;
 saveButton.disabled=true;

 try{
   if(editingId){
     await updateDoc(doc(db,"creditEntries",editingId),entryData);
     $("creditEntryStatus").textContent="✅ Entry Update হয়েছে।";
   }else{
     await addDoc(entriesRef,{...entryData,createdAt:serverTimestamp()});
     $("creditEntryStatus").textContent="✅ Entry Save হয়েছে।";
   }
   resetEntry();
 }catch(e){
   $("creditEntryStatus").textContent="❌ "+e.message;
 }finally{
   setTimeout(()=>{
     creditSaveInProgress=false;
     saveButton.disabled=false;
   },800);
 }
}

const creditSaveButton=$("saveCreditEntryBtn");
if(creditSaveButton && creditSaveButton.dataset.bound!=="1"){
 creditSaveButton.dataset.bound="1";
 creditSaveButton.addEventListener("click",saveCreditEntryOnce);
}

function render(){
 const year=$("creditYearFilter").value;
 const selectedProgram=$("creditProgramFilter").value;
 const ps=programs.filter(p=>(year==="all"||String(p.year)===year)&&(selectedProgram==="all"||p.id===selectedProgram)).sort((a,b)=>Number(b.year)-Number(a.year));
 const visibleEntries=entries.filter(e=>{
   const c=categories.find(x=>x.id===e.categoryId);
   const p=programs.find(x=>x.id===e.programId);
   const text=`${e.name||""} ${e.note||""} ${c?.name||""} ${p?.name||""}`.toLowerCase();
   return (categoryFilter==="all"||e.categoryId===categoryFilter) && (!searchText||text.includes(searchText));
 });
 const grand=visibleEntries.filter(e=>ps.some(p=>p.id===e.programId)).reduce((s,e)=>s+Number(e.amount||0),0);
 $("creditProgramSummary").innerHTML=`<div class="credit-summary-card">💰 Filtered Total Credit: ${money(grand)}</div>`;
 $("adminCreditList").innerHTML=ps.map(p=>{
   const pe=visibleEntries.filter(e=>e.programId===p.id);
   const pcs=categories.filter(c=>c.programId===p.id && (categoryFilter==="all"||c.id===categoryFilter) && (pe.some(e=>e.categoryId===c.id)||!searchText));
   if(!pcs.length) return "";
   const pt=pe.reduce((s,e)=>s+Number(e.amount||0),0);
   return `<div class="credit-flat-program-title"><h3>🎉 ${esc(p.name)} — ${esc(p.year)}</h3><span class="credit-total">Total: ${money(pt)}</span></div>`+
   pcs.map(c=>{
     const ce=pe.filter(e=>e.categoryId===c.id).sort((a,b)=>{
     const at=a.createdAt?.seconds ?? a.updatedAt?.seconds ?? 0;
     const bt=b.createdAt?.seconds ?? b.updatedAt?.seconds ?? 0;
     if(at!==bt) return at-bt;
     return String(a.id||"").localeCompare(String(b.id||""));
   }),ct=ce.reduce((s,e)=>s+Number(e.amount||0),0);
     if(searchText&&!ce.length)return "";
     const peopleCount=new Set(ce.map(e=>String(e.name||"").trim().toLowerCase()).filter(Boolean)).size;
     return `<section class="credit-flat-category-card"><div class="credit-flat-category-head"><strong>📂 ${esc(c.name)} <span class="category-people-count">👥 ${peopleCount} জন</span></strong><div class="category-head-right"><strong>${money(ct)}</strong><button class="category-rename-btn" data-credit-category-action="rename" data-id="${c.id}">✏️ Rename</button><button class="category-delete-btn" data-credit-category-action="delete" data-id="${c.id}">🗑️ Delete</button></div></div>${ce.length?ce.map((e,index)=>`<div class="credit-flat-entry ${e.highlight?"highlighted":""}"><span class="credit-serial">${String(index+1).padStart(3,"0")}</span><span>${e.highlight?"⭐ ":""}${esc(e.name)}</span><span>${money(e.amount)}</span><span>${esc(e.date||"তারিখ নেই")}</span><span>${esc(e.note||"—")}</span><span class="credit-entry-actions"><button class="credit-edit-btn" data-a="edit" data-id="${e.id}">✏️</button><button class="credit-delete-btn" data-a="delete" data-id="${e.id}">🗑️</button></span></div>`).join(""):"<p>কোনো Entry নেই।</p>"}</section>`;
   }).join("");
 }).join("") || "<p>কোনো matching Credit Entry পাওয়া যায়নি।</p>";
}

$("adminCreditList")?.addEventListener("click",async ev=>{
 const b=ev.target.closest("button[data-a]");if(!b)return;const e=entries.find(x=>x.id===b.dataset.id);if(!e)return;
 if(b.dataset.a==="delete"){if(confirm(`"${e.name}" Entry Delete করবেন?`))await deleteDoc(doc(db,"creditEntries",e.id));return}
 editingId=e.id;$("entryProgramSelect").value=e.programId;fillCategories();$("entryCategorySelect").value=e.categoryId;$("creditEntryName").value=e.name||"";$("creditEntryAmount").value=e.amount||"";$("creditEntryDate").value=e.date||"";$("creditEntryNote").value=e.note||"";$("creditEntryHighlight").checked=!!e.highlight;$("saveCreditEntryBtn").textContent="💾 Update Entry";$("cancelCreditEditBtn").style.display="block";
});
$("creditYearFilter")?.addEventListener("change",()=>{fillCreditProgramFilter();categoryFilter="all";renderCategoryChips();render();});
$("creditProgramFilter")?.addEventListener("change",()=>{categoryFilter="all";renderCategoryChips();render();});

onSnapshot(programsRef,s=>{
    programs=s.docs.map(d=>({id:d.id,...d.data()}));

    fillPrograms();

    fillMemberPrograms();   // <-- এটা যোগ করো

    fillCreditProgramFilter();

    renderCategoryChips();

    render();
});
fillMemberPrograms();
onSnapshot(categoriesRef,s=>{categories=s.docs.map(d=>({id:d.id,...d.data()}));fillCategories();renderCategoryChips();render()});
fillMemberCategories();
onSnapshot(entriesRef,s=>{
 const raw=s.docs.map(d=>({id:d.id,...d.data()}));
 const seen=new Set();
 entries=raw.filter(e=>{
   const created=e.createdAt?.seconds ?? 0;
   const key=[e.programId,e.categoryId,String(e.name||"").trim().toLowerCase(),Number(e.amount||0),e.date||"",String(e.note||"").trim().toLowerCase(),created].join("|");
   if(seen.has(key)) return false;
   seen.add(key);
   return true;
 });
 renderCategoryChips();
 render();
});
resetEntry();

/* FINAL DEPENDENT FILTER FIX: YEAR -> PROGRAM -> CATEGORY */
function refreshCreditFilterChain(resetProgram=false){
    const year=document.getElementById("creditYearFilter")?.value || "all";
    const programSelect=document.getElementById("creditProgramFilter");
    if(!programSelect) return;

    const oldProgram=resetProgram ? "all" : programSelect.value;
    const yearPrograms=programs.filter(p=>year==="all" || String(p.year)===String(year));

    programSelect.innerHTML='<option value="all">সব Program</option>'+
        yearPrograms.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");

    programSelect.value=yearPrograms.some(p=>p.id===oldProgram) ? oldProgram : "all";

    const selectedProgram=programSelect.value;
    const allowedIds=new Set(
        yearPrograms
          .filter(p=>selectedProgram==="all" || p.id===selectedProgram)
          .map(p=>p.id)
    );

    const visibleCategories=categories.filter(c=>allowedIds.has(c.programId));
    if(categoryFilter!=="all" && !visibleCategories.some(c=>c.id===categoryFilter)){
        categoryFilter="all";
    }

    $("creditCategoryScroll").innerHTML=
      `<button type="button" class="credit-category-chip ${categoryFilter==="all"?"active":""}" data-category-filter="all">সব Category</button>`+
      visibleCategories.map(c=>`<button type="button" class="credit-category-chip ${categoryFilter===c.id?"active":""}" data-category-filter="${c.id}">${esc(c.name)}</button>`).join("");

    render();
}

document.getElementById("creditYearFilter")?.addEventListener("change",()=>{
    categoryFilter="all";
    refreshCreditFilterChain(true);
});

document.getElementById("creditProgramFilter")?.addEventListener("change",()=>{
    categoryFilter="all";
    refreshCreditFilterChain(false);
});

setTimeout(()=>refreshCreditFilterChain(false),500);

/* CREDIT CATEGORY MANAGEMENT */
document.getElementById("adminCreditList")?.addEventListener("click", async (event)=>{
  const button=event.target.closest("[data-credit-category-action]");
  if(!button) return;
  const category=categories.find(c=>c.id===button.dataset.id);
  if(!category) return;

  if(button.dataset.creditCategoryAction==="rename"){
    const nextName=prompt("নতুন Category Name লিখুন:", category.name || "");
    if(nextName===null) return;
    const cleanName=nextName.trim();
    if(!cleanName) return alert("Category Name খালি রাখা যাবে না।");
    await updateDoc(doc(db,"creditCategories",category.id),{
      name:cleanName,
      updatedAt:serverTimestamp()
    });
    return;
  }

  if(button.dataset.creditCategoryAction==="delete"){
    const related=entries.filter(e=>e.categoryId===category.id);
    const message=related.length
      ? `"${category.name}" Category-তে ${related.length}টি Entry আছে। OK করলে Category এবং সব Entry Delete হবে।`
      : `"${category.name}" Category Delete করবেন?`;
    if(!confirm(message)) return;

    for(const entry of related){
      await deleteDoc(doc(db,"creditEntries",entry.id));
    }
    await deleteDoc(doc(db,"creditCategories",category.id));
    if(categoryFilter===category.id) categoryFilter="all";
  }
});
// =========================
// Member Collection Year
// =========================

const mcYear = document.getElementById("mcYear");

if (mcYear) {

    const currentYear = new Date().getFullYear();

    for (let year = currentYear + 1; year >= 2020; year--) {

        const option = document.createElement("option");

        option.value = year;

        option.textContent = year;

        mcYear.appendChild(option);

    }

    mcYear.value = currentYear;

}
/* ===========================================
   MEMBER COLLECTION SEARCH
=========================================== */

const memberSearch =
document.getElementById("memberSearch");

const memberSearchResult =
document.getElementById("memberSearchResult");

const selectedMemberBox =
document.getElementById("selectedMember");

let allMembers = [];

let selectedMemberData = null;

async function loadMembers(){

    const snap = await getDocs(collection(db,"members"));

    allMembers = [];

    snap.forEach(doc=>{

        allMembers.push({

            id:doc.id,

            ...doc.data()

        });

    });

}

loadMembers();
memberSearch?.addEventListener("input",()=>{

const keyword =
memberSearch.value.trim().toLowerCase();

if(keyword===""){

memberSearchResult.innerHTML="";

memberSearchResult.style.display="none";

return;

}

const result = allMembers.filter(m=>{

const n=(m.name||m.memberName||"")
.toLowerCase();

const id=(m.memberId||"")
.toLowerCase();

return n.includes(keyword)||id.includes(keyword);

});

renderMemberResult(result);

});
function renderMemberResult(list){

memberSearchResult.innerHTML="";

if(list.length===0){

memberSearchResult.style.display="none";

return;

}

memberSearchResult.style.display="block";

list.forEach(member=>{

const div=document.createElement("div");

div.className="member-item";

div.innerHTML=`

<div class="member-name">

${member.name || member.memberName}

</div>

<div class="member-id">

${member.memberId}

</div>

`;

div.onclick=()=>{

selectedMemberData=member;

selectedMemberBox.innerHTML=`

<b>${member.name || member.memberName}</b>

<br>

${member.memberId}

`;

memberSearch.value=

member.name || member.memberName;

memberSearchResult.style.display="none";

};

memberSearchResult.appendChild(div);

});

}
/* ===========================================
   MEMBER COLLECTION PROGRAM
=========================================== */

function fillMemberPrograms(){

    const mcProgram = document.getElementById("mcProgram");

    if(!mcProgram) return;

    mcProgram.innerHTML =
        '<option value="">Program নির্বাচন করুন</option>';

    programs
    .sort((a,b)=>Number(b.year)-Number(a.year))
    .forEach(program=>{

        const option=document.createElement("option");

        option.value=program.id;

        option.textContent=
            `${program.name} (${program.year})`;

        mcProgram.appendChild(option);

    });

}
?.addEventListener(
    "change",
    fillMemberCategories
);
