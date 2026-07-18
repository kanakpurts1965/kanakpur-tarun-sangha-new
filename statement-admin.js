import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const creditRef = collection(db, "creditEntries");
const debitRef = collection(db, "debitEntries");
const contractRef = collection(db, "contracts");
const programRef = collection(db, "programs");

let credits = [];
let debits = [];
let contracts = [];
let programs = [];

const $ = (id) => document.getElementById(id);

function money(v) {
    return "₹" + Number(v || 0).toLocaleString("en-IN");
}

function updateSummary() {

    const totalCredit = credits.reduce(
        (s, e) => s + Number(e.amount || 0),
        0
    );

    const totalDebit = debits.reduce(
        (s, e) => s + Number(e.amount || 0),
        0
    );

    const totalContract = contracts.reduce(
        (s, e) => s + Number(e.contractAmount || 0),
        0
    );

    const totalPaid = debits.reduce(
        (s, e) => s + Number(e.amount || 0),
        0
    );

    const totalDue = Math.max(
        totalContract - totalPaid,
        0
    );

    const balance = totalCredit - totalDebit;

    $("totalCredit").textContent = money(totalCredit);
    $("totalDebit").textContent = money(totalDebit);
    $("totalContract").textContent = money(totalContract);
    $("totalPaid").textContent = money(totalPaid);
    $("totalDue").textContent = money(totalDue);
    $("currentBalance").textContent = money(balance);

}

onSnapshot(
    creditRef,
    (snap) => {
        credits = snap.docs.map(
            d => ({
                id: d.id,
                ...d.data()
            })
        );
        updateSummary();
    }
);

onSnapshot(
    debitRef,
    (snap) => {
        debits = snap.docs.map(
            d => ({
                id: d.id,
                ...d.data()
            })
        );
        updateSummary();
    }
);

onSnapshot(
    contractRef,
    (snap) => {
        contracts = snap.docs.map(
            d => ({
                id: d.id,
                ...d.data()
            })
        );
        updateSummary();
    }
);

onSnapshot(
    programRef,
    (snap) => {
        programs = snap.docs.map(
            d => ({
                id: d.id,
                ...d.data()
            })
        );
    }
);
document.addEventListener("DOMContentLoaded",()=>{
const ids=["totalCredit","totalDebit","totalContract","totalPaid","totalDue","currentBalance"];
ids.forEach(id=>{
 const el=document.getElementById(id);
 if(el) el.textContent="₹0";
});
console.log("Statement Module Loaded");
});

// TODO:
// Connect Firebase collections
// Load Year & Program filters
// Calculate totals
// Populate statement table
// Print / PDF / Excel export
