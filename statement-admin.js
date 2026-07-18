import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const creditRef = collection(db, "creditEntries");
const debitRef = collection(db, "debitEntries");
const contractRef = collection(db, "contracts");
const programRef = collection(db, "programs");

let credits = [];
let debits = [];
let contracts = [];
let programs = [];

function money(v) {
  return "₹" + Number(v || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

function getProgram(id) {
  return programs.find(p => p.id === id);
}

function getProgramName(id) {
  const p = getProgram(id);
  return p ? p.name : "-";
}

function getProgramYear(id) {
  const p = getProgram(id);
  return p ? String(p.year) : "";
}

function updateSummary() {

  const totalCredit =
    credits.reduce((s, e) =>
      s + Number(e.amount || 0), 0);

  const totalDebit =
    debits.reduce((s, e) =>
      s + Number(e.amount || 0), 0);

  const totalContract =
    contracts.reduce((s, e) =>
      s + Number(e.contractAmount || 0), 0);

  const totalPaid =
    debits.reduce((s, e) =>
      s + Number(e.amount || 0), 0);

  const totalDue =
    Math.max(totalContract - totalPaid, 0);

  const balance =
    totalCredit - totalDebit;
if ($("totalCredit")) $("totalCredit").textContent = money(totalCredit);

if ($("totalDebit")) $("totalDebit").textContent = money(totalDebit);

if ($("totalContract")) $("totalContract").textContent = money(totalContract);

if ($("totalPaid")) $("totalPaid").textContent = money(totalPaid);

if ($("totalDue")) $("totalDue").textContent = money(totalDue);

if ($("currentBalance")) $("currentBalance").textContent = money(balance);

}

function fillYearFilter() {

  const el = $("yearFilter");

  if (!el) return;

  const years = [
    ...new Set(
      programs
      .map(p => String(p.year))
      .filter(Boolean)
    )
  ].sort((a, b) => b - a);

  el.innerHTML =
    '<option value="all">সব বছর</option>' +
    years.map(y =>
      `<option value="${y}">${y}</option>`
    ).join("");

}

function fillProgramFilter() {

  const year =
    $("yearFilter")?.value || "all";

  const el =
    $("programFilter");

  if (!el) return;

  const list =
    programs.filter(p =>
      year === "all" ||
      String(p.year) === String(year)
    );

  el.innerHTML =
    '<option value="all">সব Program</option>' +
    list.map(p =>
      `<option value="${p.id}">${p.name}</option>`
    ).join("");

}
function buildStatement() {

  const year =
    $("yearFilter")?.value || "all";

  const program =
    $("programFilter")?.value || "all";

  let rows = [];

  credits.forEach(c => {

    rows.push({

      date: c.date || "",

      year: getProgramYear(c.programId),

      programId: c.programId,

      program: getProgramName(c.programId),

      type: "Credit",

      name: c.name || "",

      amount: Number(c.amount || 0),

      status: "Received"

    });

  });

  debits.forEach(d => {

    rows.push({

      date: d.date || "",

      year: getProgramYear(d.programId),

      programId: d.programId,

      program: getProgramName(d.programId),

      type: "Debit",

      name: d.name || "",

      amount: Number(d.amount || 0),

      status: "Paid"

    });

  });

  contracts.forEach(c => {

    const paid =
      debits
      .filter(x => x.categoryId === c.categoryId)
      .reduce((s, x) =>
        s + Number(x.amount || 0), 0);

    rows.push({

      date: c.contractDate || "",

      year: c.year || "",

      programId: c.programId,

      program: getProgramName(c.programId),

      type: "Contract",

      name: c.contractor || "",

      amount: Number(c.contractAmount || 0),

      status:
      paid >= Number(c.contractAmount || 0)
      ? "Completed"
      : "Pending"

    });

  });

  rows = rows.filter(r => {

    const yearOK =
      year === "all" ||
      String(r.year) === String(year);

    const programOK =
      program === "all" ||
      r.programId === program;

    return yearOK && programOK;

  });

  rows.sort(
    (a, b) =>
    (b.date || "")
    .localeCompare(a.date || "")
  );

  renderStatement(rows);

}

function renderStatement(rows) {

  const body =
    $("statementBody");

  if (!body) return;

  body.innerHTML = "";

  if (!rows.length) {

    body.innerHTML =

    `<tr>

      <td colspan="7">

      কোনো Statement পাওয়া যায়নি

      </td>

    </tr>`;

    return;

  }

  rows.forEach(r => {

    body.innerHTML += `

<tr>

<td>${r.date}</td>

<td>${r.year}</td>

<td>${r.program}</td>

<td>${r.type}</td>

<td>${r.name}</td>

<td>${money(r.amount)}</td>

<td>${r.status}</td>

</tr>

`;

  });

}
document
.getElementById("yearFilter")
?.addEventListener("change", () => {

    fillProgramFilter();

    buildStatement();

});

document
.getElementById("programFilter")
?.addEventListener("change", () => {

    buildStatement();

});

onSnapshot(
    creditRef,
    (snap) => {

        credits =
        snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        updateSummary();

        buildStatement();

    }
);

onSnapshot(
    debitRef,
    (snap) => {

        debits =
        snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        updateSummary();

        buildStatement();

    }
);

onSnapshot(
    contractRef,
    (snap) => {

        contracts =
        snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        updateSummary();

        buildStatement();

    }
);

onSnapshot(
    programRef,
    (snap) => {

        programs =
        snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        fillYearFilter();

        fillProgramFilter();

        buildStatement();

    }
);
function printStatement() {

    window.print();

}

function exportCSV() {

    const rows = [];

    rows.push([
        "Date",
        "Year",
        "Program",
        "Type",
        "Name",
        "Amount",
        "Status"
    ]);

    document
    .querySelectorAll("#statementBody tr")
    .forEach(tr => {

        const cols = [
            ...tr.querySelectorAll("td")
        ].map(td => td.innerText);

        if (cols.length) {

            rows.push(cols);

        }

    });

    const csv =
        rows
        .map(r =>
            r.map(v => `"${v}"`).join(",")
        )
        .join("\n");

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "Statement.csv";

    a.click();

    URL.revokeObjectURL(url);

}

document
.getElementById("printBtn")
?.addEventListener(
    "click",
    printStatement
);

document
.getElementById("excelBtn")
?.addEventListener(
    "click",
    exportCSV
);
function exportPDF() {

    const win = window.open("", "_blank");

    const credit =
        document.getElementById("totalCredit").innerText;

    const debit =
        document.getElementById("totalDebit").innerText;

    const contract =
        document.getElementById("totalContract").innerText;

    const paid =
        document.getElementById("totalPaid").innerText;

    const due =
        document.getElementById("totalDue").innerText;

    const balance =
        document.getElementById("currentBalance").innerText;

    const table =
        document.getElementById("statementBody").parentElement.outerHTML;

    win.document.write(`

<!DOCTYPE html>

<html>

<head>

<title>Statement Report</title>

<style>

body{

font-family:Arial,sans-serif;

padding:25px;

}

h1{

text-align:center;

margin-bottom:5px;

}

h3{

text-align:center;

margin-top:0;

color:#666;

}

.summary{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:15px;

margin:25px 0;

}

.card{

border:1px solid #ccc;

padding:12px;

text-align:center;

border-radius:8px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

border:1px solid #000;

padding:8px;

text-align:center;

}

th{

background:#eee;

}

.footer{

margin-top:30px;

text-align:center;

font-size:14px;

color:#555;

}

</style>

</head>

<body>

<h1>

Club Accounts Management System

</h1>

<h3>

Statement Report

</h3>

<div class="summary">

<div class="card">

<b>Total Credit</b>

<br>

${credit}

</div>

<div class="card">

<b>Total Debit</b>

<br>

${debit}

</div>

<div class="card">

<b>Total Contract</b>

<br>

${contract}

</div>

<div class="card">

<b>Total Paid</b>

<br>

${paid}

</div>

<div class="card">

<b>Total Due</b>

<br>

${due}

</div>

<div class="card">

<b>Current Balance</b>

<br>

${balance}

</div>

</div>

${table}

<div class="footer">

Designed & Developed by Tanmoy Adak

</div>

</body>

</html>

`);

    win.document.close();

    win.focus();

    win.print();

}

document

.getElementById("pdfBtn")

?.addEventListener(

"click",

exportPDF

);
/* ---------- SEARCH ---------- */

const searchBox = document.getElementById("searchBox");

if (searchBox) {

searchBox.addEventListener("input", () => {

const text = searchBox.value.trim().toLowerCase();

document.querySelectorAll("#statementBody tr").forEach(row=>{

const value=row.innerText.toLowerCase();

row.style.display=value.includes(text)?"":"none";

});

});

}


/* ---------- AUTO REFRESH TOTAL ---------- */

function refreshStatement(){

updateSummary();

buildStatement();

}


/* ---------- GLOBAL ---------- */

window.refreshStatement=refreshStatement;
window.printStatement=printStatement;
window.exportCSV=exportCSV;
window.exportPDF=exportPDF;

console.log("Statement Module Loaded Successfully");
/* ==========================================
   PUBLISH / UNPUBLISH STATEMENT
========================================== */

const publishBtn = document.getElementById("publishStatementBtn");
const unpublishBtn = document.getElementById("unpublishStatementBtn");

if (publishBtn) {

    publishBtn.addEventListener("click", async () => {

        try {

            const statementData = {
                credits,
                debits,
                contracts,
                programs,
                publishedAt: new Date().toISOString()
            };

            await setDoc(
                doc(db, "publishedStatements", "current"),
                statementData
            );

            alert("✅ Statement Published Successfully");

        } catch (err) {

            console.error(err);
            alert("❌ Publish Failed");

        }

    });

}

if (unpublishBtn) {

    unpublishBtn.addEventListener("click", async () => {

        try {

            await deleteDoc(
                doc(db, "publishedStatements", "current")
            );

            alert("✅ Statement Unpublished");

        } catch (err) {

            console.error(err);
            alert("❌ Unpublish Failed");

        }

    });

}
