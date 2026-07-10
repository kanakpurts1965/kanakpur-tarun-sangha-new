import { db } from "./firebase.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $=id=>document.getElementById(id);
const programsRef=collection(db,"programs"), categoriesRef=collection(db,"creditCategories"), entriesRef=collection(db,"creditEntries");
let programs=[],categories=[],entries=[],editingId=null;

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
 const grand=entries.filter(e=>ps.some(p=>p.id===e.programId)).reduce((s,e)=>s+Number(e.amount||0),0);
 $("creditProgramSummary").innerHTML=`<div class="credit-summary-card">💰 Selected Programs Total Credit: ${money(grand)}</div>`;
 $("adminCreditList").innerHTML=ps.length?ps.map(p=>{
  const pcs=categories.filter(c=>c.programId===p.id);
  const pe=entries.filter(e=>e.programId===p.id);
  const pt=pe.reduce((s,e)=>s+Number(e.amount||0),0);
  return `<section class="credit-program-block"><div class="credit-program-title"><h3>🎉 ${esc(p.name)} — ${esc(p.year)}</h3><span class="credit-total">Total Credit: ${money(pt)}</span></div>${pcs.length?pcs.map(c=>{
   const ce=pe.filter(e=>e.categoryId===c.id),ct=ce.reduce((s,e)=>s+Number(e.amount||0),0);
   return `<div class="credit-category-block"><div class="credit-category-head"><strong>📂 ${esc(c.name)}</strong><strong>${money(ct)}</strong></div>${ce.length?ce.map(e=>`<div class="credit-entry-row ${e.highlight?"highlighted":""}"><span>${e.highlight?"⭐ ":""}${esc(e.name)}</span><span>${money(e.amount)}</span><span>${esc(e.date||"তারিখ নেই")}</span><span>${esc(e.note||"—")}</span><span class="credit-entry-actions"><button class="credit-edit-btn" data-a="edit" data-id="${e.id}">✏️</button><button class="credit-delete-btn" data-a="delete" data-id="${e.id}">🗑️</button></span></div>`).join(""):"<p>কোনো Entry নেই।</p>"}</div>`;
  }).join(""):"<p>এই Program-এ এখনও Income Category নেই।</p>"}</section>`;
 }).join(""):"<p>কোনো Program নেই।";
}

$("adminCreditList")?.addEventListener("click",async ev=>{
 const b=ev.target.closest("button[data-a]");if(!b)return;const e=entries.find(x=>x.id===b.dataset.id);if(!e)return;
 if(b.dataset.a==="delete"){if(confirm(`"${e.name}" Entry Delete করবেন?`))await deleteDoc(doc(db,"creditEntries",e.id));return}
 editingId=e.id;$("entryProgramSelect").value=e.programId;fillCategories();$("entryCategorySelect").value=e.categoryId;$("creditEntryName").value=e.name||"";$("creditEntryAmount").value=e.amount||"";$("creditEntryDate").value=e.date||"";$("creditEntryNote").value=e.note||"";$("creditEntryHighlight").checked=!!e.highlight;$("saveCreditEntryBtn").textContent="💾 Update Entry";$("cancelCreditEditBtn").style.display="block";
});
$("creditYearFilter")?.addEventListener("change",render);

onSnapshot(programsRef,s=>{programs=s.docs.map(d=>({id:d.id,...d.data()}));fillPrograms();render()});
onSnapshot(categoriesRef,s=>{categories=s.docs.map(d=>({id:d.id,...d.data()}));fillCategories();render()});
onSnapshot(entriesRef,s=>{entries=s.docs.map(d=>({id:d.id,...d.data()}));render()});
resetEntry();
