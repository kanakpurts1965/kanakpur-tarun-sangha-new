import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const countdownBar =
    document.getElementById("homeEventCountdownBar");

const eventName =
    document.getElementById("homeEventBarName");

const eventDate =
    document.getElementById("homeEventBarDate");

const daysLeft =
    document.getElementById("homeEventDaysLeft");

const liveCountdown =
    document.getElementById("homeEventLiveCountdown");


let countdownTimer = null;


if (
    !countdownBar ||
    !eventName ||
    !eventDate ||
    !daysLeft ||
    !liveCountdown
) {
    console.error("Home Event HTML elements পাওয়া যায়নি");
}


onSnapshot(

    collection(db, "events"),

    (snapshot) => {

        console.log(
            "Total Events:",
            snapshot.size
        );


        const now = new Date();

        const events = [];


        snapshot.forEach((docItem) => {

            const data =
                docItem.data();


            console.log(
                "EVENT DATA:",
                data
            );


            if (!data.date) return;


            const dateParts =
                String(data.date).split("-");


            if (dateParts.length !== 3) {

                console.error(
                    "Wrong Event Date:",
                    data.date
                );

                return;
            }


            const year =
                Number(dateParts[0]);

            const month =
                Number(dateParts[1]) - 1;

            const day =
                Number(dateParts[2]);


            let hour = 0;
            let minute = 0;


            if (data.time) {

                const timeParts =
                    String(data.time).split(":");


                hour =
                    Number(timeParts[0]) || 0;

                minute =
                    Number(timeParts[1]) || 0;

            }


            const targetDate =
                new Date(
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    0
                );


            if (
                Number.isNaN(
                    targetDate.getTime()
                )
            ) {

                return;

            }


            if (
                targetDate.getTime() >
                now.getTime()
            ) {

                events.push({

                    id: docItem.id,

                    name:
                        data.name ||
                        "Upcoming Event",

                    date:
                        data.date,

                    time:
                        data.time || "",

                    targetDate

                });

            }

        });


        events.sort(

            (a, b) =>
                a.targetDate -
                b.targetDate

        );


        if (events.length === 0) {

            countdownBar.style.display =
                "none";

            console.log(
                "No upcoming event found"
            );

            return;

        }


        const nextEvent =
            events[0];


        countdownBar.style.display =
            "block";


        eventName.textContent =
            "🎉 " + nextEvent.name;


        eventDate.textContent =
            "📅 " +
            nextEvent.targetDate
                .toLocaleDateString(
                    "bn-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


        startCountdown(
            nextEvent.targetDate
        );

    },

    (error) => {

        console.error(
            "HOME EVENT FIRESTORE ERROR:",
            error
        );

    }

);


function startCountdown(targetDate) {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

    }


    function update() {

        const difference =
            targetDate.getTime() -
            Date.now();


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


        const days =
            Math.floor(
                difference /
                86400000
            );


        const hours =
            Math.floor(
                (difference % 86400000) /
                3600000
            );


        const minutes =
            Math.floor(
                (difference % 3600000) /
                60000
            );


        const seconds =
            Math.floor(
                (difference % 60000) /
                1000
            );


        const totalDays =
            Math.ceil(
                difference /
                86400000
            );


        daysLeft.textContent =
            `⏳ আর ${totalDays} দিন বাকি`;


        liveCountdown.textContent =

            `${pad(days)}d : ` +
            `${pad(hours)}h : ` +
            `${pad(minutes)}m : ` +
            `${pad(seconds)}s`;

    }


    update();


    countdownTimer =
        setInterval(
            update,
            1000
        );

}


function pad(number) {

    return String(number)
        .padStart(2, "0");

}
