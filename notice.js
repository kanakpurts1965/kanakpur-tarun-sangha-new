import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const publicNoticeList =
    document.getElementById(
        "publicNoticeList"
    );


const noticesRef =
    collection(db, "notices");


const noticeQuery =
    query(
        noticesRef,
        orderBy("date", "desc")
    );


onSnapshot(

    noticeQuery,

    (snapshot) => {

        if (!publicNoticeList) return;


        publicNoticeList.innerHTML = "";


        if (snapshot.empty) {

            publicNoticeList.innerHTML = `

                <div class="public-notice-empty">

                    📭 বর্তমানে কোনো নোটিশ নেই।

                </div>

            `;

            return;
        }


        snapshot.forEach((item) => {

            const data = item.data();


            const noticeCard =
                document.createElement("article");


            noticeCard.className =
                "public-notice-card";


            noticeCard.innerHTML = `

                <div class="notice-date">

                    📅 ${formatDate(data.date)}

                </div>


                <h3>

                    📌 ${safe(data.title)}

                </h3>


              <p>
    ${linkify(data.text)}
</p>

            `;


            publicNoticeList.appendChild(
                noticeCard
            );

        });

    },

    (error) => {

        console.error(
            "NOTICE LOAD ERROR:",
            error
        );


        publicNoticeList.innerHTML = `

            <div class="public-notice-empty">

                ❌ নোটিশ Load করা যায়নি।

            </div>

        `;

    }

);


function formatDate(dateString) {

    if (!dateString) {

        return "তারিখ নেই";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(

        "bn-IN",

        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }

    );

}


function safe(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


function linkify(value = "") {

    const safeText = safe(value);

    const urlRegex = /(https?:\/\/[^\s<]+)/g;

    return safeText.replace(
        urlRegex,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}
