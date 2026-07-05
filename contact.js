// =====================================================
// KTS PUBLIC CONTACT SYSTEM
// =====================================================

import { db } from "./firebase.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const publicContactAddress =
    document.getElementById(
        "publicContactAddress"
    );

const publicContactMobile =
    document.getElementById(
        "publicContactMobile"
    );

const publicContactEmail =
    document.getElementById(
        "publicContactEmail"
    );

const publicContactMap =
    document.getElementById(
        "publicContactMap"
    );


const contactDocRef =
    doc(db, "siteSettings", "contact");


onSnapshot(

    contactDocRef,

    (snapshot) => {

        if (!snapshot.exists()) return;

        const data =
            snapshot.data();


        if (publicContactAddress) {

            publicContactAddress.textContent =
                data.address || "তথ্য যোগ করা হয়নি";

        }


        if (publicContactMobile) {

            publicContactMobile.textContent =
                data.mobile || "তথ্য যোগ করা হয়নি";


            if (data.mobile) {

                publicContactMobile.href =
                    `tel:${data.mobile}`;

            }

        }


        if (publicContactEmail) {

            publicContactEmail.textContent =
                data.email || "তথ্য যোগ করা হয়নি";


            if (data.email) {

                publicContactEmail.href =
                    `mailto:${data.email}`;

            }

        }


        if (publicContactMap) {

            if (data.map) {

                publicContactMap.href =
                    data.map;

                publicContactMap.style.display =
                    "inline-flex";

            }

            else {

                publicContactMap.style.display =
                    "none";

            }

        }

    },

    (error) => {

        console.error(
            "PUBLIC CONTACT ERROR:",
            error
        );

    }

);
