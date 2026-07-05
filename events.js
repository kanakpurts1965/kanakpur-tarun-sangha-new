// =====================================================
// KTS PUBLIC EVENT SYSTEM
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const publicEventList =
    document.getElementById("publicEventList");


const eventsRef =
    collection(db, "events");


const eventQuery =
    query(
        eventsRef,
        orderBy("createdAt", "desc")
    );


// =====================================================
// LOAD EVENTS
// =====================================================

onSnapshot(

    eventQuery,

    (snapshot) => {

        if (!publicEventList) return;


        publicEventList.innerHTML = "";


        if (snapshot.empty) {

            publicEventList.innerHTML = `

                <div class="public-event-empty">

                    🎉 বর্তমানে কোনো Event নেই।

                </div>

            `;

            return;
        }


        snapshot.forEach((item) => {

            const data =
                item.data();


            const pointsHTML =

                (data.descriptionPoints || [])

                .map(point => `

                    <li>
                        ${safe(point)}
                    </li>

                `)

                .join("");


            const eventCard =
                document.createElement("article");


            eventCard.className =
                "public-event-card";


            eventCard.innerHTML = `

                <!-- EVENT NAME -->

                <h2 class="public-event-name">

                    ${safe(data.name || "")}

                </h2>


                <!-- EVENT BANNER -->

                <div class="public-event-banner-box">

                    <img

                        src="${safeAttribute(
                            data.bannerURL || ""
                        )}"

                        alt="${safeAttribute(
                            data.name || "Event Banner"
                        )}"

                        loading="lazy"

                    >

                </div>


                <!-- DATE + TIME -->

                <div class="public-event-date-time">

                    <div>
                        📅
                        <strong>Date:</strong>
                        ${formatDate(data.date)}
                    </div>


                    <div>
                        ⏰
                        <strong>Time:</strong>
                        ${formatTime(data.time)}
                    </div>

                </div>


                <!-- PLACE -->

                <div class="public-event-place">

                    📍
                    <strong>Place:</strong>

                    ${safe(data.place || "")}

                </div>


                <!-- DESCRIPTION -->

                <div class="public-event-description">

                    <h3>
                        📝 Description
                    </h3>


                    <ol>

                        ${pointsHTML}

                    </ol>

                </div>

            `;


            publicEventList.appendChild(
                eventCard
            );

        });

    },

    (error) => {

        console.error(
            "PUBLIC EVENT ERROR:",
            error
        );


        if (publicEventList) {

            publicEventList.innerHTML = `

                <div class="public-event-empty">

                    ❌ Event Load করা যায়নি।

                </div>

            `;

        }

    }

);


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) return "";


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return safe(dateValue);

    }


    return date.toLocaleDateString(

        "bn-IN",

        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }

    );

}


// =====================================================
// TIME FORMAT
// =====================================================

function formatTime(timeValue) {

    if (!timeValue) return "";


    const parts =
        timeValue.split(":");


    const hour =
        Number(parts[0]);


    const minute =
        parts[1] || "00";


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    const displayHour =
        hour % 12 || 12;


    return `${displayHour}:${minute} ${period}`;

}


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


function safeAttribute(value = "") {

    return safe(value);

}
