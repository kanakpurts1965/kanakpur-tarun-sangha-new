const contractsRef = collection(db, "contracts");

let contracts = [];

let editingContract = null;
onSnapshot(contractsRef, (snapshot) => {

    contracts = snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

    }));

    renderContracts();

});
function resetContractForm() {

    editingContract = null;

    document.getElementById("contractName").value = "";

    document.getElementById("contractAmount").value = "";

    document.getElementById("contractDate").value = "";

    document.getElementById("contractNote").value = "";

}
document
.getElementById("saveContractBtn")
.addEventListener("click", saveContract);
async function saveContract(){

    const name =
        document.getElementById("contractName").value.trim();

    const amount =
        Number(
            document.getElementById("contractAmount").value
        );

    const date =
        document.getElementById("contractDate").value;

    const note =
        document.getElementById("contractNote").value.trim();

    const year =
        document.getElementById("contractYearFilter").value;

    const program =
        document.getElementById("contractProgramFilter").value;

    const category =
        document.getElementById("contractCategoryFilter").value;

    if(
        !name ||
        !amount ||
        !program ||
        !category
    ){

        alert("সব তথ্য পূরণ করুন");

        return;

    }

    const already =
        contracts.find(item =>

            item.name.toLowerCase() === name.toLowerCase()

            &&

            item.programId === program

            &&

            item.categoryId === category

        );

    if(already && !editingContract){

        alert("এই Contractor আগে থেকেই আছে");

        return;

    }

    if(editingContract){

        await updateDoc(

            doc(db,"contracts",editingContract),

            {

                name,

                amount,

                date,

                note,

                year,

                programId:program,

                categoryId:category

            }

        );

    }

    else{

        await addDoc(

            contractsRef,

            {

                name,

                amount,

                date,

                note,

                year,

                programId:program,

                categoryId:category,

                createdAt:serverTimestamp()

            }

        );

    }

    resetContractForm();

}
