// =====================================================
// KTS CONTACT ADMIN SYSTEM
// =====================================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


const contactAddress =
    document.getElementById("contactAddress");

const contactMobile =
    document.getElementById("contactMobile");

const contactEmail =
    document.getElementById("contactEmail");

const contactMap =
    document.getElementById("contactMap");
const contactFacebook =
    document.getElementById("contactFacebook");

const saveContactBtn =
    document.getElementById("saveContactBtn");

const contactSaveStatus =
    document.getElementById("contactSaveStatus");


const contactDocRef =
    doc(db, "siteSettings", "contact");


// LOAD OLD DATA

async function loadContactData() {

    try {

        const snapshot =
            await getDoc(contactDocRef);

        if (!snapshot.exists()) return;

        const data = snapshot.data();

        contactAddress.value =
            data.address || "";

        contactMobile.value =
            data.mobile || "";

        contactEmail.value =
            data.email || "";

        contactMap.value =
            data.map || "";
        contactFacebook.value =
    data.facebook || "";

    }

    catch (error) {

        console.error(
            "CONTACT LOAD ERROR:",
            error
        );

    }

}


loadContactData();


// SAVE / UPDATE

saveContactBtn?.addEventListener(
    "click",
    async () => {

        const address =
            contactAddress.value.trim();

        const mobile =
            contactMobile.value.trim();

        const email =
            contactEmail.value.trim();

        const map =
            contactMap.value.trim();
        const facebook =
    contactFacebook.value.trim();


        if (!address) {

            alert("❌ Club Address লিখুন");

            return;
        }


        try {

            saveContactBtn.disabled = true;

            saveContactBtn.textContent =
                "⏳ Save হচ্ছে...";


            await setDoc(

                contactDocRef,

                {
                    address,
                    mobile,
                    email,
                    map,
                     facebook,
                    updatedAt:
                        serverTimestamp()
                },

                {
                    merge: true
                }

            );


            contactSaveStatus.textContent =
                "✅ Contact Information Save হয়েছে";


            alert(
                "✅ Contact Information Save হয়েছে"
            );

        }

        catch (error) {

            console.error(
                "CONTACT SAVE ERROR:",
                error
            );


            alert(
                "❌ Save হয়নি: " +
                error.message
            );

        }

        finally {

            saveContactBtn.disabled = false;

            saveContactBtn.textContent =
                "💾 Contact Save করুন";

        }

    }
);
