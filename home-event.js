// =====================================================
// KTS HOME UPCOMING EVENT COUNTDOWN BAR
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const countdownBar =
    document.getElementById(
        "homeEventCountdownBar"
    );

const eventName =
    document.getElementById(
        "homeEventBarName"
    );

const eventDate =
    document.getElementById(
        "homeEventBarDate"
    );

const daysLeft =
    document.getElementById(
        "homeEventDaysLeft"
    );

const liveCountdown =
    document.getElementById(
        "homeEventLiveCountdown"
    );


let countdownTimer = null;


// =====================================================
// LOAD EVENTS
// =====================================================

onSnapshot(

    collection(db, "events"),

    (snapshot) => {

        const now =
            new Date();


        const upcomingEvents = [];


        snapshot.forEach((item) => {

            const data =
                item.data();


            if (!data.date) return;


            const eventDateTime =
                new Date(

                    `${data.date}T${data.time || "00:00"}:00`

                );


            if (
                eventDateTime.getTime() >
                now.getTime()
            ) {

                upcomingEvents.push({

                    ...data,

                    id: item.id,

                    eventDateTime

                });

            }

        });


        // NEAREST EVENT FIRST

        upcomingEvents.sort(

            (a, b) =>

                a.eventDateTime -
                b.eventDateTime

        );


        if (!upcomingEvents.length) {

            countdownBar.style.display =
                "none";

            return;

        }


        showUpcomingEvent(
            upcomingEvents[0]
        );

    },

    (error) => {

        console.error(
            "HOME EVENT ERROR:",
            error
        );

    }

);


// =====================================================
// SHOW EVENT
// =====================================================

function showUpcomingEvent(event) {

    countdownBar.style.display =
        "block";


    eventName.textContent =
        `🎉 ${event.name || "Upcoming Event"}`;


    eventDate.textContent =
        "📅 " +
        event.eventDateTime
            .toLocaleDateString(

                "bn-IN",

                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }

            );


    startCountdown(
        event.eventDateTime
    );

}


// =====================================================
// LIVE REVERSE COUNTDOWN
// =====================================================

function startCountdown(targetDate) {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

    }


    function updateCountdown() {

        const now =
            new Date();


        const difference =
            targetDate.getTime() -
            now.getTime();


        if (difference <= 0) {

            daysLeft.textContent =
                "🎉 অনুষ্ঠান শুরু হয়েছে";


            liveCountdown.textContent =
                "LIVE";


            clearInterval(
                countdownTimer
            );


            return;

        }


        const totalDays =
            Math.ceil(

                difference /
                (1000 * 60 * 60 * 24)

            );


        const days =
            Math.floor(

                difference /
                (1000 * 60 * 60 * 24)

            );


        const hours =
            Math.floor(

                (
                    difference %
                    (1000 * 60 * 60 * 24)
                ) /

                (1000 * 60 * 60)

            );


        const minutes =
            Math.floor(

                (
                    difference %
                    (1000 * 60 * 60)
                ) /

                (1000 * 60)

            );


        const seconds =
            Math.floor(

                (
                    difference %
                    (1000 * 60)
                ) /

                1000

            );


        daysLeft.textContent =
            `⏳ আর ${totalDays} দিন বাকি`;


        liveCountdown.textContent =

            `${pad(days)}d : ` +

            `${pad(hours)}h : ` +

            `${pad(minutes)}m : ` +

            `${pad(seconds)}s`;

    }


    updateCountdown();


    countdownTimer =
        setInterval(

            updateCountdown,

            1000

        );

}


// =====================================================
// PAD NUMBER
// =====================================================

function pad(number) {

    return String(number)
        .padStart(2, "0");

}
