import { db } from "./firebase.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $=id=>document.getElementById(id);
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

function fillCategories(){
 const pid=$("entryProgramSelect").value;
 $("entryCategorySelect").innerHTML='<option value="">Category নির্বাচন করুন</option>'+categories.filter(c=>c.programId===pid).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
}
$("entryProgramSelect")?.addEventListener("change",fillCategories);

function renderCategoryChips(){
 const current=categoryFilter;
 const year=$("creditYearFilter").value;
 const allowedProgramIds=new Set(
   programs.filter(p=>year==="all"||String(p.year)===year).map(p=>p.id)
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

$("saveCreditEntryBtn")?.addEventListener("click",async()=>{
 const data={programId:$("entryProgramSelect").value,categoryId:$("entryCategorySelect").value,name:$("creditEntryName").value.trim(),amount:Number($("creditEntryAmount").value),date:$("creditEntryDate").value,note:$("creditEntryNote").value.trim(),highlight:$("creditEntryHighlight").checked,updatedAt:serverTimestamp()};
 if(!data.programId||!data.categoryId||!data.name||!(data.amount>0)){$("creditEntryStatus").textContent="⚠️ Program, Category, Name এবং সঠিক Amount দিন।";return}
 try{
  if(editingId) await updateDoc(doc(db,"creditEntries",editingId),data); else await addDoc(entriesRef,{...data,createdAt:serverTimestamp()});
  $("creditEntryStatus").textContent=editingId?"✅ Entry Update হয়েছে।":"✅ Entry Save হয়েছে।";resetEntry();
 }catch(e){$("creditEntryStatus").textContent="❌ "+e.message}
});

function render(){
 const year=$("creditYearFilter").value;
 const ps=programs.filter(p=>year==="all"||String(p.year)===year).sort((a,b)=>Number(b.year)-Number(a.year));
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
     const ce=pe.filter(e=>e.categoryId===c.id),ct=ce.reduce((s,e)=>s+Number(e.amount||0),0);
     if(searchText&&!ce.length)return "";
     const peopleCount=new Set(ce.map(e=>String(e.name||"").trim().toLowerCase()).filter(Boolean)).size;
     return `<section class="credit-flat-category-card"><div class="credit-flat-category-head"><strong>📂 ${esc(c.name)} <span class="category-people-count">👥 ${peopleCount} জন</span></strong><strong>${money(ct)}</strong></div>${ce.length?ce.map((e,index)=>`<div class="credit-flat-entry ${e.highlight?"highlighted":""}"><span class="credit-serial">${String(index+1).padStart(3,"0")}</span><span>${e.highlight?"⭐ ":""}${esc(e.name)}</span><span>${money(e.amount)}</span><span>${esc(e.date||"তারিখ নেই")}</span><span>${esc(e.note||"—")}</span><span class="credit-entry-actions"><button class="credit-edit-btn" data-a="edit" data-id="${e.id}">✏️</button><button class="credit-delete-btn" data-a="delete" data-id="${e.id}">🗑️</button></span></div>`).join(""):"<p>কোনো Entry নেই।</p>"}</section>`;
   }).join("");
 }).join("") || "<p>কোনো matching Credit Entry পাওয়া যায়নি।</p>";
}

$("adminCreditList")?.addEventListener("click",async ev=>{
 const b=ev.target.closest("button[data-a]");if(!b)return;const e=entries.find(x=>x.id===b.dataset.id);if(!e)return;
 if(b.dataset.a==="delete"){if(confirm(`"${e.name}" Entry Delete করবেন?`))await deleteDoc(doc(db,"creditEntries",e.id));return}
 editingId=e.id;$("entryProgramSelect").value=e.programId;fillCategories();$("entryCategorySelect").value=e.categoryId;$("creditEntryName").value=e.name||"";$("creditEntryAmount").value=e.amount||"";$("creditEntryDate").value=e.date||"";$("creditEntryNote").value=e.note||"";$("creditEntryHighlight").checked=!!e.highlight;$("saveCreditEntryBtn").textContent="💾 Update Entry";$("cancelCreditEditBtn").style.display="block";
});
$("creditYearFilter")?.addEventListener("change",()=>{renderCategoryChips();render();});

onSnapshot(programsRef,s=>{programs=s.docs.map(d=>({id:d.id,...d.data()}));fillPrograms();render()});
onSnapshot(categoriesRef,s=>{categories=s.docs.map(d=>({id:d.id,...d.data()}));fillCategories();renderCategoryChips();render()});
onSnapshot(entriesRef,s=>{entries=s.docs.map(d=>({id:d.id,...d.data()}));renderCategoryChips();render()});
resetEntry();
