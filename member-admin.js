// =====================================================
// KTS MEMBER ADMIN SYSTEM
// Phase 1 - Part 4 - Step 4
// ADD + LIST + SEARCH + EDIT + DELETE 
// =====================================================
 
import { db } from "./firebase.js"; 

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    updateDoc,
    deleteDoc,
    doc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// =====================================================
// FIRESTORE COLLECTION
// =====================================================

const membersRef = collection(db, "members");


// =====================================================
// FORM ELEMENTS
// =====================================================

const memberName =
    document.getElementById("memberName");

const memberMobile =
    document.getElementById("memberMobile");

const memberBlood =
    document.getElementById("memberBlood");

const memberPosition =
    document.getElementById("memberPosition");

const memberPhoto =
    document.getElementById("memberPhoto");

const addMemberBtn =
    document.getElementById("addMemberBtn");

const adminMemberList =
    document.getElementById("adminMemberList");

const adminMemberSearch =
    document.getElementById("adminMemberSearch");


// =====================================================
// EDIT MODE VARIABLE
// =====================================================

let editingMemberId = null;


// =====================================================
// ADD OR UPDATE MEMBER
// =====================================================

if (addMemberBtn) {

    addMemberBtn.addEventListener("click", async () => {

        const name =
            memberName.value.trim();

        const mobile =
            memberMobile.value.trim();

        const bloodGroup =
            memberBlood.value;

        const position =
            memberPosition.value;

        const photo =
            memberPhoto.value.trim();


        // ==========================================
        // VALIDATION
        // ==========================================

        if (name === "") {

            alert("❌ সদস্যের নাম লিখুন");

            memberName.focus();

            return;

        }


        if (mobile === "") {

            alert("❌ মোবাইল নম্বর লিখুন");

            memberMobile.focus();

            return;

        }


        if (bloodGroup === "") {

            alert("❌ Blood Group নির্বাচন করুন");

            return;

        }


        if (position === "") {

            alert("❌ সদস্যের পদ নির্বাচন করুন");

            return;

        }


        try {

            addMemberBtn.disabled = true;


            // ==========================================
            // EDIT MEMBER
            // ==========================================

            if (editingMemberId) {

                addMemberBtn.innerText =
                    "⏳ Updating...";


                await updateDoc(

                    doc(
                        db,
                        "members",
                        editingMemberId
                    ),

                    {

                        name: name,

                        mobile: mobile,

                        bloodGroup: bloodGroup,

                        position: position,

                        photo:
                            photo || "member.png"

                    }

                );


                alert(
                    "✅ সদস্যের তথ্য Update হয়েছে"
                );


                editingMemberId = null;

            }


            // ==========================================
            // ADD NEW MEMBER
            // ==========================================

            else {

                addMemberBtn.innerText =
                    "⏳ Saving...";


              const membersSnapshot = await getDocs(membersRef);

let highestSerial = 0;

membersSnapshot.forEach((memberDoc) => {

    const memberData = memberDoc.data();

    const serialNumber =
        Number(memberData.serial) || 0;

    if (serialNumber > highestSerial) {

        highestSerial = serialNumber;

    }

});

const nextSerial = highestSerial + 1;


                await addDoc(membersRef, {

                    name: name,

                    mobile: mobile,

                    bloodGroup: bloodGroup,

                    position: position,

                    photo:
                        photo || "member.png",

                    serial:
                        nextSerial,

                    createdAt:
                        serverTimestamp()

                });


                alert(
                    "✅ সদস্য সফলভাবে যোগ হয়েছে"
                );

            }


            // ==========================================
            // CLEAR FORM
            // ==========================================

            clearMemberForm();

        }

        catch (error) {

            console.error(error);

            alert(
                "❌ Member Save / Update করা যায়নি"
            );

        }

        finally {

            addMemberBtn.disabled = false;

            addMemberBtn.innerText =
                "💾 সদস্য Save করুন";

        }

    });

}


// =====================================================
// CLEAR MEMBER FORM
// =====================================================

function clearMemberForm() {

    memberName.value = "";

    memberMobile.value = "";

    memberBlood.value = "";

    memberPosition.value = "";

    memberPhoto.value = "";

    editingMemberId = null;

    addMemberBtn.innerText =
        "💾 সদস্য Save করুন";

}


// =====================================================
// REAL-TIME MEMBER LIST
// =====================================================

if (adminMemberList) {

    const memberQuery =
        query(
            membersRef,
            orderBy("serial", "asc")
        );


    onSnapshot(

        memberQuery,

        (snapshot) => {

            adminMemberList.innerHTML = "";


            if (snapshot.empty) {

                adminMemberList.innerHTML = `

                    <p class="member-loading">

                        কোনো সদস্য পাওয়া যায়নি।

                    </p>

                `;

                return;

            }


           let displaySerial = 1;

snapshot.forEach((item) => {

    const data = item.data();


                const card =
                    document.createElement("div");


                card.className =
                    "admin-member-card";


                card.innerHTML = `

                    <div class="admin-member-serial">

                    ${String(
                    displaySerial++
                    ).padStart(3, "0")}

                    </div>


                    <img
                        src="${data.photo || "member.png"}"
                        class="admin-member-photo"
                        alt="Member Photo"
                    >


                    <div class="admin-member-info">

                        <h4>

                            ${data.name || ""}

                        </h4>


                        <p>

                            📞 ${data.mobile || ""}

                        </p>


                        <p>

                            🩸 ${data.bloodGroup || ""}

                        </p>


                        <p>

                            👔 ${data.position || ""}

                        </p>

                    </div>


                    <div class="admin-member-actions">


                        <button
                            class="edit-member-btn"

                            data-id="${item.id}"

                            data-name="${data.name || ""}"

                            data-mobile="${data.mobile || ""}"

                            data-blood="${data.bloodGroup || ""}"

                            data-position="${data.position || ""}"

                            data-photo="${data.photo || "member.png"}"
                        >

                            ✏️ Edit

                        </button>


                        <button
                            class="delete-member-btn"

                            data-id="${item.id}"

                            data-name="${data.name || ""}"
                        >

                            🗑️ Delete

                        </button>


                    </div>

                `;


                adminMemberList.appendChild(card);

            });

        },


        (error) => {

            console.error(error);


            adminMemberList.innerHTML = `

                <p class="member-loading">

                    ❌ সদস্য তালিকা Load করা যায়নি।

                </p>

            `;

        }

    );

}


// =====================================================
// EDIT MEMBER BUTTON
// =====================================================

document.addEventListener(
    "click",

    (event) => {

        const editBtn =
            event.target.closest(
                ".edit-member-btn"
            );


        if (!editBtn) return;


        // Member ID

        editingMemberId =
            editBtn.dataset.id;


        // Form Fill

        memberName.value =
            editBtn.dataset.name;


        memberMobile.value =
            editBtn.dataset.mobile;


        memberBlood.value =
            editBtn.dataset.blood;


        memberPosition.value =
            editBtn.dataset.position;


        memberPhoto.value =
            editBtn.dataset.photo;


        // Button Change

        addMemberBtn.innerText =
            "🔄 সদস্য Update করুন";


        // Form-এর উপরে নিয়ে যাবে

        const memberManagementBox =
            document.querySelector(
                ".member-management-box"
            );


        if (memberManagementBox) {

            memberManagementBox.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

    }

);


// =====================================================
// DELETE MEMBER
// =====================================================

document.addEventListener(
    "click",

    async (event) => {

        const deleteBtn =
            event.target.closest(
                ".delete-member-btn"
            );


        if (!deleteBtn) return;


        const memberId =
            deleteBtn.dataset.id;


        const memberNameText =
            deleteBtn.dataset.name;


        const confirmDelete =
            confirm(

                `"${memberNameText}" সদস্যকে Delete করবেন?`

            );


        if (!confirmDelete) return;


        try {

            await deleteDoc(

                doc(
                    db,
                    "members",
                    memberId
                )

            );


            alert(
                "✅ সদস্য সফলভাবে Delete হয়েছে"
            );


            // যদি একই Member Edit Mode-এ থাকে

            if (
                editingMemberId === memberId
            ) {

                clearMemberForm();

            }

        }

        catch (error) {

            console.error(error);


            alert(
                "❌ Member Delete করা যায়নি"
            );

        }

    }

);


// =====================================================
// ADMIN MEMBER SEARCH
// =====================================================

if (adminMemberSearch) {

    adminMemberSearch.addEventListener(
        "input",

        () => {

            const searchValue =
                adminMemberSearch
                    .value
                    .toLowerCase()
                    .trim();


            const memberCards =
                document.querySelectorAll(
                    ".admin-member-card"
                );


            memberCards.forEach((card) => {

                const memberText =
                    card.innerText
                        .toLowerCase();


                if (
                    memberText.includes(
                        searchValue
                    )
                ) {

                    card.style.display =
                        "flex";

                }

                else {

                    card.style.display =
                        "none";

                }

            });

        }

    );

}
