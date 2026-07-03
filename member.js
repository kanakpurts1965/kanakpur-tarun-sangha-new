// =====================================================
// KTS PUBLIC MEMBER SYSTEM
// Firestore Real-time Load
// Search + Blood Filter
// =====================================================


import { db } from "./firebase.js";


import {

    collection,

    onSnapshot,

    query,

    orderBy

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";



// =====================================================
// FIRESTORE MEMBERS COLLECTION
// =====================================================


const membersRef = collection(db, "members");



// =====================================================
// HTML ELEMENTS
// =====================================================


const memberList =
    document.getElementById("memberList");


const memberSearch =
    document.getElementById("memberSearch");


const bloodFilter =
    document.getElementById("bloodFilter");



// =====================================================
// STORE MEMBER DATA
// =====================================================


let allMembers = [];



// =====================================================
// FIRESTORE REAL-TIME MEMBER LOAD
// =====================================================


if (memberList) {


    const memberQuery = query(

        membersRef,

        orderBy("serial", "asc")

    );



    onSnapshot(

        memberQuery,


        (snapshot) => {


            allMembers = [];


            snapshot.forEach((memberDoc) => {


                const data = memberDoc.data();


                allMembers.push({

                    id: memberDoc.id,

                    name:
                        data.name || "",

                    mobile:
                        data.mobile || "",

                    bloodGroup:
                        data.bloodGroup || "",

                    position:
                        data.position || "",

                    photo:
                        data.photo || "member.png",

                    serial:
                        Number(data.serial) || 0

                });


            });



            // Member List Show

            displayMembers(allMembers);


        },


        (error) => {


            console.error(
                "Member Load Error:",
                error
            );


            memberList.innerHTML = `

                <p style="text-align:center; padding:30px;">

                    ❌ সদস্য তালিকা Load করা যায়নি।

                </p>

            `;


        }

    );


}



// =====================================================
// DISPLAY MEMBERS
// =====================================================


function displayMembers(members) {


    if (!memberList) return;



    memberList.innerHTML = "";



    // কোনো Member না থাকলে


    if (members.length === 0) {


        memberList.innerHTML = `

            <p style="text-align:center; padding:30px;">

                কোনো সদস্য পাওয়া যায়নি।

            </p>

        `;


        return;


    }



    members.forEach((member) => {


        const row =
            document.createElement("div");


        row.className = "member-row";



        // Serial Format
        // 1 = 001
        // 2 = 002
        // 10 = 010


        const serialNumber = String(

            member.serial

        ).padStart(3, "0");



        row.innerHTML = `


            <div class="serial">

                ${serialNumber}

            </div>



            <img

                src="${member.photo}"

                class="member-photo-small"

                alt="${member.name}"

                onerror="this.src='member.png'"

            >



            <div class="member-details">


                <h3>

                    ${member.name}

                </h3>



                <div class="phone-row">

                    📞 ${member.mobile}

                </div>



                <div class="blood-row">

                    🩸 ${member.bloodGroup}

                </div>


            </div>


        `;



        memberList.appendChild(row);


    });


}



// =====================================================
// SEARCH + BLOOD FILTER TOGETHER
// =====================================================


function filterMembers() {


    const searchValue =

        memberSearch

            ? memberSearch.value
                .toLowerCase()
                .trim()

            : "";



    const bloodValue =

        bloodFilter

            ? bloodFilter.value
                .toLowerCase()
                .trim()

            : "";



    const filteredMembers = allMembers.filter(

        (member) => {


            // Search Text


            const memberText = `

                ${member.name}

                ${member.mobile}

                ${member.bloodGroup}

                ${member.position}

                ${member.serial}

            `.toLowerCase();



            const searchMatch =

                memberText.includes(
                    searchValue
                );



            // Blood Group Exact Match


            const bloodMatch =

                bloodValue === ""

                ||

                member.bloodGroup
                    .toLowerCase() === bloodValue;



            return (

                searchMatch

                &&

                bloodMatch

            );


        }

    );



    displayMembers(filteredMembers);


}



// =====================================================
// MEMBER SEARCH
// =====================================================


if (memberSearch) {


    memberSearch.addEventListener(

        "input",

        filterMembers

    );


}



// =====================================================
// BLOOD GROUP FILTER
// =====================================================


if (bloodFilter) {


    bloodFilter.addEventListener(

        "change",

        filterMembers

    );


}
