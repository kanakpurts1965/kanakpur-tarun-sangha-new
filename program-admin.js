import { db } from "./firebase.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const ref=collection(db,"programs");
const $=id=>document.getElementById(id);
let items=[],editingId=null;

function resetForm(){
 editingId=null;$("programName").value="";$("programYear").value=new Date().getFullYear();
 $("programStartDate").value="";$("programEndDate").value="";$("programDescription").value="";
 $("programStatus").value="unpublished";$("showContractToViewer").checked=false;
 $("programFormTitle").textContent="➕ নতুন Program তৈরি করুন";$("saveProgramBtn").textContent="💾 Program Save করুন";$("cancelProgramEditBtn").style.display="none";
}
$("saveProgramBtn")?.addEventListener("click",async()=>{
 const data={name:$("programName").value.trim(),year:Number($("programYear").value),startDate:$("programStartDate").value,endDate:$("programEndDate").value,description:$("programDescription").value.trim(),status:$("programStatus").value,showContractToViewer:$("showContractToViewer").checked,updatedAt:serverTimestamp()};
 if(!data.name||!data.year){$("programSaveStatus").textContent="⚠️ Program Name ও Year দিন।";return}
 if(data.startDate&&data.endDate&&data.endDate<data.startDate){$("programSaveStatus").textContent="⚠️ End Date ভুল।";return}
 try{
  if(editingId) await updateDoc(doc(db,"programs",editingId),data);
  else await addDoc(ref,{...data,createdAt:serverTimestamp()});
  $("programSaveStatus").textContent="✅ Program Save হয়েছে।";resetForm();
 }catch(e){$("programSaveStatus").textContent="❌ "+e.message}
});
$("cancelProgramEditBtn")?.addEventListener("click",resetForm);

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function years(){
 const old=$("programYearFilter").value;
 const ys=[...new Set(items.map(x=>Number(x.year)).filter(Boolean))].sort((a,b)=>b-a);
 $("programYearFilter").innerHTML='<option value="all">সব বছর</option>'+ys.map(y=>`<option value="${y}">${y}</option>`).join("");
 if(old==="all"||ys.includes(Number(old))) $("programYearFilter").value=old;
}
function render(){
 const f=$("programYearFilter").value;
 const list=items.filter(x=>f==="all"||String(x.year)===f).sort((a,b)=>Number(b.year)-Number(a.year));
 $("adminProgramList").innerHTML=list.length?list.map(p=>{
  const pub=p.status==="published";
  return `<article class="program-card"><div class="program-card-head"><div><h4>${esc(p.name)}</h4><div class="program-meta"><span>📆 ${esc(p.year)}</span><span>🗓️ ${esc(p.startDate||"তারিখ নেই")} → ${esc(p.endDate||"তারিখ নেই")}</span></div></div><span class="program-badge ${pub?"published":"unpublished"}">${pub?"🌐 Published":"🔒 Unpublished"}</span></div>${p.description?`<p>${esc(p.description)}</p>`:""}<div class="program-module-grid"><div class="program-module-chip">💰 Credit</div><div class="program-module-chip">💸 Debit</div><div class="program-module-chip">📋 Contract & Payable</div><div class="program-module-chip">👥 Member Contribution</div><div class="program-module-chip">📁 Files / Documents</div><div class="program-module-chip">📜 Agreement Copies</div></div><p>Viewer Contract: <b>${p.showContractToViewer?"ON":"OFF"}</b></p><div class="program-actions"><button class="program-edit-btn" data-a="edit" data-id="${p.id}">✏️ Edit</button><button class="${pub?"program-unpublish-btn":"program-publish-btn"}" data-a="toggle" data-id="${p.id}">${pub?"🔒 Unpublish":"🌐 Publish"}</button><button class="program-delete-btn" data-a="delete" data-id="${p.id}">🗑️ Delete</button></div></article>`;
 }).join(""):"<p>কোনো Program নেই।";
}
$("adminProgramList")?.addEventListener("click",async e=>{
 const b=e.target.closest("button[data-a]");if(!b)return;const p=items.find(x=>x.id===b.dataset.id);if(!p)return;
 if(b.dataset.a==="edit"){editingId=p.id;$("programName").value=p.name||"";$("programYear").value=p.year||"";$("programStartDate").value=p.startDate||"";$("programEndDate").value=p.endDate||"";$("programDescription").value=p.description||"";$("programStatus").value=p.status||"unpublished";$("showContractToViewer").checked=!!p.showContractToViewer;$("programFormTitle").textContent="✏️ Program Edit করুন";$("saveProgramBtn").textContent="💾 Update Program";$("cancelProgramEditBtn").style.display="block";return}
 if(b.dataset.a==="toggle") await updateDoc(doc(db,"programs",p.id),{status:p.status==="published"?"unpublished":"published",updatedAt:serverTimestamp()});
 if(b.dataset.a==="delete"&&confirm(`"${p.name}" Delete করবেন?`)) await deleteDoc(doc(db,"programs",p.id));
});
$("programYearFilter")?.addEventListener("change",render);
onSnapshot(ref,s=>{items=s.docs.map(d=>({id:d.id,...d.data()}));years();render()},e=>{$("adminProgramList").textContent="Program load হয়নি: "+e.message});
resetForm();
