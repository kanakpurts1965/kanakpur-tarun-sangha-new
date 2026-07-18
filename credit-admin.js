/* PART 1/5 */
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
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const programsRef = collection(db, "programs");
const categoriesRef = collection(db, "creditCategories");
const entriesRef = collection(db, "creditEntries");

let programs = [];
let categories = [];
let entries = [];
let editingId = null;

let categoryFilter = "all";
let searchText = "";

function esc(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function money(v){
  return "₹"+Number(v||0).toLocaleString("en-IN",{
    maximumFractionDigits:2
  });
}

function fillPrograms(){

  const options =
    '<option value="">Program নির্বাচন করুন</option>' +
    programs
      .sort((a,b)=>Number(b.year)-Number(a.year))
      .map(p=>`
        <option value="${p.id}">
          ${esc(p.name)} (${esc(p.year)})
        </option>
      `).join("");

  const oldCategoryProgram =
    $("creditProgramSelect").value;

  const oldEntryProgram =
    $("entryProgramSelect").value;

  $("creditProgramSelect").innerHTML = options;
  $("entryProgramSelect").innerHTML = options;

  $("creditProgramSelect").value =
    oldCategoryProgram;

  $("entryProgramSelect").value =
    oldEntryProgram;

  const oldYear =
    $("creditYearFilter").value;

  const years = [
    ...new Set(
      programs
      .map(p=>Number(p.year))
      .filter(Boolean)
    )
  ].sort((a,b)=>b-a);

  $("creditYearFilter").innerHTML =
    '<option value="all">সব বছর</option>' +
    years.map(y=>`
      <option value="${y}">
        ${y}
      </option>
    `).join("");

  if(
    oldYear==="all" ||
    years.includes(Number(oldYear))
  ){
    $("creditYearFilter").value=oldYear;
  }

}
/* PART 2/5 */

function fillCreditProgramFilter(){

  const year = $("creditYearFilter").value;
  const old = $("creditProgramFilter").value;

  const visiblePrograms =
    programs.filter(p =>
      year==="all" ||
      String(p.year)===year
    );

  $("creditProgramFilter").innerHTML =
    '<option value="all">সব Program</option>' +
    visiblePrograms.map(p=>`
      <option value="${p.id}">
        ${esc(p.name)}
      </option>
    `).join("");

  $("creditProgramFilter").value =
    visiblePrograms.some(p=>p.id===old)
      ? old
      : "all";

}

function fillCategories(){

  const pid =
    $("entryProgramSelect").value;

  $("entryCategorySelect").innerHTML =
    '<option value="">Category নির্বাচন করুন</option>' +
    categories
      .filter(c=>c.programId===pid)
      .map(c=>`
        <option value="${c.id}">
          ${esc(c.name)}
        </option>
      `).join("");

}

$("entryProgramSelect")
?.addEventListener(
  "change",
  fillCategories
);

function renderCategoryChips(){

  const year =
    $("creditYearFilter").value;

  const selectedProgram =
    $("creditProgramFilter").value;

  const allowedProgramIds =
    new Set(

      programs
      .filter(p=>

        (year==="all" ||
        String(p.year)===year)

        &&

        (selectedProgram==="all" ||
        p.id===selectedProgram)

      )
      .map(p=>p.id)

    );

  const visibleCategories =
    categories.filter(c=>
      allowedProgramIds.has(c.programId)
    );

  if(
    categoryFilter!=="all" &&
    !visibleCategories.some(
      c=>c.id===categoryFilter
    )
  ){
    categoryFilter="all";
  }

  $("creditCategoryScroll").innerHTML=

    `<button
        type="button"
        class="credit-category-chip ${
          categoryFilter==="all"
          ?"active":""
        }"
        data-category-filter="all">
        সব Category
    </button>`

    +

    visibleCategories.map(c=>`

      <button
          type="button"
          class="credit-category-chip ${
            categoryFilter===c.id
            ?"active":""
          }"
          data-category-filter="${c.id}">

          ${esc(c.name)}

      </button>

    `).join("");

}

$("creditCategoryScroll")
?.addEventListener("click",e=>{

  const button =
    e.target.closest(
      "[data-category-filter]"
    );

  if(!button) return;

  categoryFilter =
    button.dataset.categoryFilter;

  renderCategoryChips();

  render();

});

$("creditSearchInput")
?.addEventListener("input",e=>{

  searchText =
    e.target.value
      .trim()
      .toLowerCase();

  render();

});
/* PART 3/5 */

$("saveCreditCategoryBtn")
?.addEventListener("click",async()=>{

  const programId =
    $("creditProgramSelect").value;

  const name =
    $("creditCategoryName")
      .value
      .trim();

  if(!programId || !name){

    $("creditCategoryStatus").textContent =
      "⚠️ Program ও Category Name দিন।";

    return;

  }

  const duplicate =
    categories.some(c=>

      c.programId===programId &&

      String(c.name)
      .toLowerCase()===name.toLowerCase()

    );

  if(duplicate){

    $("creditCategoryStatus").textContent =
      "⚠️ এই Category আগে থেকেই আছে।";

    return;

  }

  try{

    await addDoc(categoriesRef,{
      programId,
      name,
      createdAt:serverTimestamp()
    });

    $("creditCategoryName").value="";

    $("creditCategoryStatus").textContent =
      "✅ Category Save হয়েছে।";

  }

  catch(error){

    $("creditCategoryStatus").textContent =
      "❌ "+error.message;

  }

});

function resetEntry(){

  editingId=null;

  $("creditEntryName").value="";

  $("creditEntryAmount").value="";

  $("creditEntryDate").value="";

  $("creditEntryNote").value="";

  $("creditEntryHighlight").checked=false;

  $("saveCreditEntryBtn").textContent =
    "💾 Entry Save করুন";

  $("cancelCreditEditBtn").style.display =
    "none";

}

$("cancelCreditEditBtn")
?.addEventListener(
  "click",
  resetEntry
);

let creditSaveInProgress=false;

async function saveCreditEntryOnce(){

  if(creditSaveInProgress) return;

  const saveButton =
    $("saveCreditEntryBtn");

  const data={

    programId:
      $("entryProgramSelect").value,

    categoryId:
      $("entryCategorySelect").value,

    name:
      $("creditEntryName")
      .value.trim(),

    amount:Number(
      $("creditEntryAmount").value
    ),

    date:
      $("creditEntryDate").value,

    note:
      $("creditEntryNote")
      .value.trim(),

    highlight:
      $("creditEntryHighlight").checked,

    updatedAt:
      serverTimestamp()

  };

  if(

    !data.programId ||

    !data.categoryId ||

    !data.name ||

    !(data.amount>0)

  ){

    $("creditEntryStatus").textContent =
      "⚠️ Program, Category, Name এবং Amount দিন।";

    return;

  }

  creditSaveInProgress=true;

  saveButton.disabled=true;

  try{

    if(editingId){

      await updateDoc(
        doc(db,"creditEntries",editingId),
        data
      );

      $("creditEntryStatus").textContent =
        "✅ Entry Update হয়েছে।";

    }else{

      await addDoc(
        entriesRef,
        {
          ...data,
          createdAt:serverTimestamp()
        }
      );

      $("creditEntryStatus").textContent =
        "✅ Entry Save হয়েছে।";

    }

    resetEntry();

  }

  catch(error){

    $("creditEntryStatus").textContent =
      "❌ "+error.message;

  }

  finally{

    setTimeout(()=>{

      creditSaveInProgress=false;

      saveButton.disabled=false;

    },800);

  }

}

const saveButton =
$("saveCreditEntryBtn");

if(
  saveButton &&
  saveButton.dataset.bound!=="1"
){

  saveButton.dataset.bound="1";

  saveButton.addEventListener(
    "click",
    saveCreditEntryOnce
  );

}
/* PART 4/5 */

onSnapshot(programsRef,(snapshot)=>{

  programs = snapshot.docs.map(doc=>({
    id:doc.id,
    ...doc.data()
  }));

  fillPrograms();

  fillCreditProgramFilter();

  renderCategoryChips();

  render();

});

onSnapshot(categoriesRef,(snapshot)=>{

  categories = snapshot.docs.map(doc=>({
    id:doc.id,
    ...doc.data()
  }));

  fillCategories();

  fillMemberCategories();

  renderCategoryChips();

  render();

});

onSnapshot(entriesRef,(snapshot)=>{

  const raw =
    snapshot.docs.map(doc=>({
      id:doc.id,
      ...doc.data()
    }));

  const seen = new Set();

  entries = raw.filter(entry=>{

    const created =
      entry.createdAt?.seconds ??
      entry.updatedAt?.seconds ??
      0;

    const key=[

      entry.programId,

      entry.categoryId,

      String(entry.name||"")
      .trim()
      .toLowerCase(),

      Number(entry.amount||0),

      entry.date||"",

      String(entry.note||"")
      .trim()
      .toLowerCase(),

      created

    ].join("|");

    if(seen.has(key)){

      return false;

    }

    seen.add(key);

    return true;

  });

  renderCategoryChips();

  render();

});

$("adminCreditList")
?.addEventListener("click",async(event)=>{

  const button =
    event.target.closest("button[data-a]");

  if(!button) return;

  const entry =
    entries.find(
      e=>e.id===button.dataset.id
    );

  if(!entry) return;

  if(button.dataset.a==="delete"){

    if(confirm(`"${entry.name}" Entry Delete করবেন?`)){

      await deleteDoc(
        doc(db,"creditEntries",entry.id)
      );

    }

    return;

  }

  editingId=entry.id;

  $("entryProgramSelect").value=
    entry.programId;

  fillCategories();

  $("entryCategorySelect").value=
    entry.categoryId;

  $("creditEntryName").value=
    entry.name||"";

  $("creditEntryAmount").value=
    entry.amount||"";

  $("creditEntryDate").value=
    entry.date||"";

  $("creditEntryNote").value=
    entry.note||"";

  $("creditEntryHighlight").checked=
    !!entry.highlight;

  $("saveCreditEntryBtn").textContent=
    "💾 Update Entry";

  $("cancelCreditEditBtn").style.display=
    "block";

});

$("creditYearFilter")
?.addEventListener("change",()=>{

  fillCreditProgramFilter();

  categoryFilter="all";

  renderCategoryChips();

  render();

});

$("creditProgramFilter")
?.addEventListener("change",()=>{

  categoryFilter="all";

  renderCategoryChips();

  render();

});

resetEntry();
/* PART 5/5 */

/* ========= CATEGORY RENAME / DELETE ========= */

document.getElementById("adminCreditList")
?.addEventListener("click",async(event)=>{

    const button=
    event.target.closest("[data-credit-category-action]");

    if(!button) return;

    const category=
    categories.find(c=>c.id===button.dataset.id);

    if(!category) return;

    if(button.dataset.creditCategoryAction==="rename"){

        const nextName=
        prompt(
            "নতুন Category Name লিখুন:",
            category.name||""
        );

        if(nextName===null) return;

        const cleanName=
        nextName.trim();

        if(!cleanName){

            alert("Category Name খালি রাখা যাবে না।");

            return;

        }

        await updateDoc(
            doc(db,"creditCategories",category.id),
            {
                name:cleanName,
                updatedAt:serverTimestamp()
            }
        );

        return;

    }

    if(button.dataset.creditCategoryAction==="delete"){

        const related=
        entries.filter(e=>e.categoryId===category.id);

        const message=
        related.length
        ? `"${category.name}" Category-তে ${related.length}টি Entry আছে। OK করলে Category এবং সব Entry Delete হবে।`
        : `"${category.name}" Category Delete করবেন?`;

        if(!confirm(message)) return;

        for(const item of related){

            await deleteDoc(
                doc(db,"creditEntries",item.id)
            );

        }

        await deleteDoc(
            doc(db,"creditCategories",category.id)
        );

        if(categoryFilter===category.id){

            categoryFilter="all";

        }

    }

});


/* ========= MEMBER COLLECTION ========= */

const mcYear=document.getElementById("mcYear");

if(mcYear){

    const currentYear=
    new Date().getFullYear();

    for(let year=currentYear+1;year>=2020;year--){

        const option=
        document.createElement("option");

        option.value=year;

        option.textContent=year;

        mcYear.appendChild(option);

    }

    mcYear.value=currentYear;

}

const memberSearch=
document.getElementById("memberSearch");

const memberSearchResult=
document.getElementById("memberSearchResult");

const selectedMember=
document.getElementById("selectedMember");

let allMembers=[];

let selectedMemberData=null;

async function loadMembers(){

    const snapshot=
    await getDocs(collection(db,"members"));

    allMembers=[];

    snapshot.forEach(doc=>{

        allMembers.push({

            id:doc.id,

            ...doc.data()

        });

    });

}

loadMembers();

memberSearch?.addEventListener("input",()=>{

    const keyword=
    memberSearch.value.trim().toLowerCase();

    if(keyword===""){

        memberSearchResult.innerHTML="";

        memberSearchResult.style.display="none";

        return;

    }

    const result=
    allMembers.filter(member=>{

        const name=
        (member.name||member.memberName||"")
        .toLowerCase();

        const id=
        (member.memberId||"")
        .toLowerCase();

        return (
            name.includes(keyword) ||
            id.includes(keyword)
        );

    });

    memberSearchResult.innerHTML="";

    memberSearchResult.style.display=
    result.length?"block":"none";

    result.forEach(member=>{

        const div=
        document.createElement("div");

        div.className="member-item";

        div.innerHTML=`
            <div>${member.name||member.memberName}</div>
            <small>${member.memberId||""}</small>
        `;

        div.onclick=()=>{

            selectedMemberData=member;

            selectedMember.innerHTML=`
                <b>${member.name||member.memberName}</b>
                <br>
                ${member.memberId||""}
            `;

            memberSearch.value=
            member.name||member.memberName;

            memberSearchResult.style.display="none";

        };

        memberSearchResult.appendChild(div);

    });

});

function fillMemberCategories(){

    const mcProgram=
    document.getElementById("mcProgram");

    const mcCategory=
    document.getElementById("mcCategory");

    if(!mcProgram||!mcCategory) return;

    mcCategory.innerHTML=
    '<option value="">Category নির্বাচন করুন</option>';

    categories
    .filter(c=>c.programId===mcProgram.value)
    .forEach(category=>{

        const option=
        document.createElement("option");

        option.value=category.id;

        option.textContent=category.name;

        mcCategory.appendChild(option);

    });

}

document
.getElementById("mcProgram")
?.addEventListener(
    "change",
    fillMemberCategories
);

console.log(
"✅ credit-admin.js Loaded Successfully"
);
