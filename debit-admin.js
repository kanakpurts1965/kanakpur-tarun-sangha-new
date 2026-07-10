import { db } from "./firebase.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $=id=>document.getElementById(id);
const programsRef=collection(db,"programs"),categoriesRef=collection(db,"debitCategories"),entriesRef=collection(db,"debitEntries");
let programs=[],categories=[],entries=[],editingId=null,categoryFilter="all",searchText="";

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function money(v){return "₹"+Number(v||0).toLocaleString("en-IN",{maximumFractionDigits:2})}

function fillPrograms(){
 const opts='<option value="">Program নির্বাচন করুন</option>'+programs.sort((a,b)=>Number(b.year)-Number(a.year)).map(p=>`<option value="${p.id}">${esc(p.name)} (${esc(p.year)})</option>`).join("");
 const a=$("debitProgramSelect").value,b=$("debitEntryProgramSelect").value;
 $("debitProgramSelect").innerHTML=opts;$("debitEntryProgramSelect").innerHTML=opts;$("debitProgramSelect").value=a;$("debitEntryProgramSelect").value=b;
 const old=$("debitYearFilter").value,ys=[...new Set(programs.map(p=>Number(p.year)).filter(Boolean))].sort((a,b)=>b-a);
 $("debitYearFilter").innerHTML='<option value="all">সব বছর</option>'+ys.map(y=>`<option value="${y}">${y}</option>`).join("");
 if(old==="all"||ys.includes(Number(old)))$("debitYearFilter").value=old;
}
function fillCategories(){
 const pid=$("debitEntryProgramSelect").value;
 $("debitEntryCategorySelect").innerHTML='<option value="">Category নির্বাচন করুন</option>'+categories.filter(c=>c.programId===pid).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
}
function renderChips(){
 const current=categoryFilter;
 const year=$("debitYearFilter").value;
 const allowedProgramIds=new Set(
   programs.filter(p=>year==="all"||String(p.year)===year).map(p=>p.id)
 );
 const visibleCategories=categories.filter(c=>allowedProgramIds.has(c.programId));
 if(current!=="all"&&!visibleCategories.some(c=>c.id===current)) categoryFilter="all";
 $("debitCategoryScroll").innerHTML=`<button type="button" class="debit-category-chip ${categoryFilter==="all"?"active":""}" data-debit-category-filter="all">সব Category</button>`+
 visibleCategories.map(c=>`<button type="button" class="debit-category-chip ${categoryFilter===c.id?"active":""}" data-debit-category-filter="${c.id}">${esc(c.name)}</button>`).join("");
}
$("debitEntryProgramSelect")?.addEventListener("change",fillCategories);
$("debitCategoryScroll")?.addEventListener("click",e=>{const b=e.target.closest("[data-debit-category-filter]");if(!b)return;categoryFilter=b.dataset.debitCategoryFilter;renderChips();render()});
$("debitSearchInput")?.addEventListener("input",e=>{searchText=e.target.value.trim().toLowerCase();render()});

$("saveDebitCategoryBtn")?.addEventListener("click",async()=>{
 const programId=$("debitProgramSelect").value,name=$("debitCategoryName").value.trim();
 if(!programId||!name){$("debitCategoryStatus").textContent="⚠️ Program ও Category Name দিন।";return}
 if(categories.some(c=>c.programId===programId&&String(c.name).toLowerCase()===name.toLowerCase())){$("debitCategoryStatus").textContent="⚠️ এই Category আগে থেকেই আছে।";return}
 try{await addDoc(categoriesRef,{programId,name,createdAt:serverTimestamp()});$("debitCategoryName").value="";$("debitCategoryStatus").textContent="✅ Category Save হয়েছে।"}catch(e){$("debitCategoryStatus").textContent="❌ "+e.message}
});

function resetEntry(){editingId=null;$("debitEntryName").value="";$("debitEntryAmount").value="";$("debitEntryDate").value="";$("debitEntryNote").value="";$("debitEntryHighlight").checked=false;$("saveDebitEntryBtn").textContent="💾 Expense Save করুন";$("cancelDebitEditBtn").style.display="none"}
$("cancelDebitEditBtn")?.addEventListener("click",resetEntry);

$("saveDebitEntryBtn")?.addEventListener("click",async()=>{
 const d={programId:$("debitEntryProgramSelect").value,categoryId:$("debitEntryCategorySelect").value,name:$("debitEntryName").value.trim(),amount:Number($("debitEntryAmount").value),date:$("debitEntryDate").value,note:$("debitEntryNote").value.trim(),highlight:$("debitEntryHighlight").checked,updatedAt:serverTimestamp()};
 if(!d.programId||!d.categoryId||!d.name||!(d.amount>0)){$("debitEntryStatus").textContent="⚠️ Program, Category, Name এবং Amount দিন।";return}
 try{if(editingId)await updateDoc(doc(db,"debitEntries",editingId),d);else await addDoc(entriesRef,{...d,createdAt:serverTimestamp()});$("debitEntryStatus").textContent=editingId?"✅ Expense Update হয়েছে।":"✅ Expense Save হয়েছে।";resetEntry()}catch(e){$("debitEntryStatus").textContent="❌ "+e.message}
});

function render(){
 const year=$("debitYearFilter").value,ps=programs.filter(p=>year==="all"||String(p.year)===year).sort((a,b)=>Number(b.year)-Number(a.year));
 const visible=entries.filter(e=>{const c=categories.find(x=>x.id===e.categoryId),p=programs.find(x=>x.id===e.programId),text=`${e.name||""} ${e.note||""} ${c?.name||""} ${p?.name||""}`.toLowerCase();return(categoryFilter==="all"||e.categoryId===categoryFilter)&&(!searchText||text.includes(searchText))});
 const grand=visible.filter(e=>ps.some(p=>p.id===e.programId)).reduce((s,e)=>s+Number(e.amount||0),0);
 $("debitProgramSummary").innerHTML=`<div class="debit-summary-card">💸 Filtered Total Debit: ${money(grand)}</div>`;
 $("adminDebitList").innerHTML=ps.map(p=>{
  const pe=visible.filter(e=>e.programId===p.id),pcs=categories.filter(c=>c.programId===p.id&&(categoryFilter==="all"||c.id===categoryFilter)&&(pe.some(e=>e.categoryId===c.id)||!searchText));
  if(!pcs.length)return"";const pt=pe.reduce((s,e)=>s+Number(e.amount||0),0);
  return `<div class="debit-flat-program-title"><h3>🎉 ${esc(p.name)} — ${esc(p.year)}</h3><span class="debit-total">Total: ${money(pt)}</span></div>`+pcs.map(c=>{
   const ce=pe.filter(e=>e.categoryId===c.id),ct=ce.reduce((s,e)=>s+Number(e.amount||0),0);if(searchText&&!ce.length)return"";
   const count=new Set(ce.map(e=>String(e.name||"").trim().toLowerCase()).filter(Boolean)).size;
   return `<section class="debit-flat-category-card"><div class="debit-flat-category-head"><strong>📂 ${esc(c.name)} <span class="debit-category-people-count">🧾 ${count} টি</span></strong><strong>${money(ct)}</strong></div>${ce.length?ce.map((e,i)=>`<div class="debit-flat-entry ${e.highlight?"highlighted":""}"><span class="debit-serial">${String(i+1).padStart(3,"0")}</span><span>${e.highlight?"⭐ ":""}${esc(e.name)}</span><span>${money(e.amount)}</span><span>${esc(e.date||"তারিখ নেই")}</span><span>${esc(e.note||"—")}</span><span class="debit-entry-actions"><button class="debit-edit-btn" data-a="edit" data-id="${e.id}">✏️</button><button class="debit-delete-btn" data-a="delete" data-id="${e.id}">🗑️</button></span></div>`).join(""):"<p>কোনো Expense Entry নেই।</p>"}</section>`
  }).join("")
 }).join("")||"<p>কোনো matching Expense পাওয়া যায়নি।</p>";
}

$("adminDebitList")?.addEventListener("click",async ev=>{
 const b=ev.target.closest("button[data-a]");if(!b)return;const e=entries.find(x=>x.id===b.dataset.id);if(!e)return;
 if(b.dataset.a==="delete"){if(confirm(`"${e.name}" Expense Delete করবেন?`))await deleteDoc(doc(db,"debitEntries",e.id));return}
 editingId=e.id;$("debitEntryProgramSelect").value=e.programId;fillCategories();$("debitEntryCategorySelect").value=e.categoryId;$("debitEntryName").value=e.name||"";$("debitEntryAmount").value=e.amount||"";$("debitEntryDate").value=e.date||"";$("debitEntryNote").value=e.note||"";$("debitEntryHighlight").checked=!!e.highlight;$("saveDebitEntryBtn").textContent="💾 Update Expense";$("cancelDebitEditBtn").style.display="block";
});
$("debitYearFilter")?.addEventListener("change",()=>{renderChips();render();});
onSnapshot(programsRef,s=>{programs=s.docs.map(d=>({id:d.id,...d.data()}));fillPrograms();render()});
onSnapshot(categoriesRef,s=>{categories=s.docs.map(d=>({id:d.id,...d.data()}));fillCategories();renderChips();render()});
onSnapshot(entriesRef,s=>{entries=s.docs.map(d=>({id:d.id,...d.data()}));render();});
resetEntry();
