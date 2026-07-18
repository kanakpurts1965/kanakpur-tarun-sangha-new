
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
