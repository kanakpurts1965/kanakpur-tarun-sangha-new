// =====================================================
// KTS MEMBER ADMIN SYSTEM
// Phase 1 - Part 4 - Step 3
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy
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
// ADD MEMBER
// =====================================================

if (addMemberBtn) {

    addMemberBtn.addEventListener(
        "click",

        async () => {

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

                // Button Lock

                addMemberBtn.disabled = true;

                addMemberBtn.innerText =
                    "⏳ Saving...";


                // ======================================
                // AUTO SERIAL
                // ======================================

                const currentMembers =
                    document.querySelectorAll(
                        "#adminMemberList .admin-member-card"
                    );

                const nextSerial =
                    currentMembers.length + 1;


                // ======================================
                // SAVE TO FIRESTORE
                // ======================================

                await addDoc(membersRef, {

                    name: name,

                    mobile: mobile,

                    bloodGroup: bloodGroup,

                    position: position,

                    photo:
                        photo || "member.png",

                    serial: nextSerial,

                    createdAt:
                        serverTimestamp()

                });


                alert(
                    "✅ সদস্য সফলভাবে যোগ হয়েছে"
                );


                // ======================================
                // CLEAR FORM
                // ======================================

                memberName.value = "";

                memberMobile.value = "";

                memberBlood.value = "";

                memberPosition.value = "";

                memberPhoto.value = "";

            }

            catch (error) {

                console.error(error);

                alert(
                    "❌ Member Save করা যায়নি"
                );

            }

            finally {

                addMemberBtn.disabled = false;

                addMemberBtn.innerText =
                    "💾 সদস্য Save করুন";

            }

        }

    );

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


            snapshot.forEach((item) => {

                const data = item.data();


                const card =
                    document.createElement("div");


                card.className =
                    "admin-member-card";


                card.innerHTML = `

                    <div class="admin-member-serial">

                        ${String(
                            data.serial || 0
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
                    memberText.includes(searchValue)
                ) {

                    card.style.display = "flex";

                }

                else {

                    card.style.display = "none";

                }

            });

        }

    );

}
