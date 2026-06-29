import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("loginMsg");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    msg.innerHTML = "⏳ লগইন হচ্ছে...";

    try {

        const adminRef = doc(db, "admins", "admin1");
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            msg.innerHTML = "❌ Admin পাওয়া যায়নি";
            return;

        }

        const admin = adminSnap.data();

        if (
            admin.username === username &&
            admin.password === password
        ) {

            msg.innerHTML = "✅ Login Successful";

            localStorage.setItem("adminLoggedIn", "true");

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 1000);

        } else {

            msg.innerHTML = "❌ Username অথবা Password ভুল";

        }

    } catch (err) {

        console.error(err);

        msg.innerHTML = "⚠️ Login Error";

    }

});
