import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const membersRef = collection(db, "members");

const executiveMemberList =
    document.getElementById("executiveMemberList");

const memberList =
    document.getElementById("memberList");

const memberSearch =
    document.getElementById("memberSearch");

const bloodFilter =
    document.getElementById("bloodFilter");


let allMembers = [];


// =====================================================
// REAL-TIME MEMBER LOAD
// =====================================================

const memberQuery = query(
    membersRef,
    orderBy("serial", "asc")
);


onSnapshot(

    memberQuery,

    (snapshot) => {

        allMembers = [];

        snapshot.forEach((item) => {

            const data = item.data();

            allMembers.push({

                id: item.id,

                name:
                    data.name || "",

                mobile:
                    data.mobile || "",

                bloodGroup:
                    data.bloodGroup || "",

                position:
                    data.position || "",

                category:
                    data.category || "general",

                photo:
                    data.photo || "",

                serial:
                    Number(data.serial) || 0

            });

        });


        renderAll();

    },

    (error) => {

        console.error(
            "PUBLIC MEMBER ERROR:",
            error
        );

    }

);


// =====================================================
// RENDER ALL
// =====================================================

function renderAll() {

    const executiveMembers =
        allMembers.filter(
            member =>
                member.category === "executive"
        );


    // সকল সদস্য box-এ সব member দেখাবে

    const allMemberList = [...allMembers];


    renderMembers(
        executiveMemberList,
        executiveMembers
    );


    renderMembers(
        memberList,
        allMemberList
    );

}


// =====================================================
// RENDER MEMBER LIST
// =====================================================

function renderMembers(container, members) {

    if (!container) return;


    container.innerHTML = "";


    if (members.length === 0) {

        container.innerHTML = `

            <p style="
                text-align:center;
                padding:25px;
            ">
                কোনো সদস্য পাওয়া যায়নি।
            </p>

        `;

        return;

    }


    members.forEach((member, index) => {


        const row =
            document.createElement("div");


        row.className = "member-row";


        const photoHTML = member.photo

            ? `
                <img
                    src="${member.photo}"
                    class="member-photo-small"
                    alt="Member Photo"
                >
              `

            : `
                <div
                    class="member-photo-small"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:28px;
                    "
                >
                    👤
                </div>
              `;


        row.innerHTML = `

            <div class="serial">

                ${String(index + 1).padStart(3, "0")}

            </div>


            ${photoHTML}


            <div class="member-details">


                <h3>
                    ${safe(member.name)}
                </h3>


                <div class="phone-row">

                    📞 ${safe(member.mobile)}

                </div>


                <div class="public-member-meta-row">

                    <span>
                        🩸 ${safe(member.bloodGroup)}
                    </span>

                    <span>
                        👔 ${safe(member.position)}
                    </span>

                </div>


            </div>

        `;


        container.appendChild(row);

    });

}


// =====================================================
// SEARCH + BLOOD FILTER
// =====================================================

function filterMembers() {


    const searchValue =

        memberSearch
            ?.value
            .toLowerCase()
            .trim()

        || "";


    const bloodValue =

        bloodFilter
            ?.value
            .toLowerCase()
            .trim()

        || "";


    const filteredMembers =
        allMembers.filter((member) => {


            const searchableText = `

                ${member.name}
                ${member.mobile}
                ${member.bloodGroup}
                ${member.position}

            `.toLowerCase();


            const searchMatch =
                searchableText.includes(searchValue);


            const bloodMatch =

                !bloodValue

                ||

                member.bloodGroup
                    .toLowerCase()
                    === bloodValue;


            return searchMatch && bloodMatch;

        });


    renderMembers(
        memberList,
        filteredMembers
    );

}


// =====================================================
// SEARCH EVENTS
// =====================================================

memberSearch?.addEventListener(
    "input",
    filterMembers
);


memberSearch?.addEventListener(
    "keyup",
    filterMembers
);


bloodFilter?.addEventListener(
    "change",
    filterMembers
);


// =====================================================
// SAFE TEXT
// =====================================================

function safe(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
