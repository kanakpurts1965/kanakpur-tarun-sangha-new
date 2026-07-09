import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


/* LOGIN PAGE OPEN হলে পুরোনো session logout */
await signOut(auth);


const ADMIN_EMAIL = "tanmoyadak112@gmail.com";
const form = document.getElementById("loginForm");
const msg = document.getElementById("loginMsg");
const forgotBtn = document.getElementById("forgotPasswordBtn");


/* ==============================
   ADMIN LOGIN
============================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const password =
        document.getElementById("password").value;

    msg.textContent = "⏳ লগইন হচ্ছে...";

    try {

        await signInWithEmailAndPassword(
            auth,
            ADMIN_EMAIL,
            password
        );

        msg.textContent = "✅ Login Successful";

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 700);

    } catch (error) {

        console.error(error);

        msg.textContent =
            "❌ Password ভুল অথবা Login করা যাচ্ছে না";

    }

});


/* ==============================
   FORGOT PASSWORD
============================== */

if (forgotBtn) {

    forgotBtn.addEventListener("click", async () => {

        try {

            forgotBtn.disabled = true;

            await sendPasswordResetEmail(
                auth,
                ADMIN_EMAIL
            );

            msg.textContent =
                "📧 Password Reset Link Email-এ পাঠানো হয়েছে";

        } catch (error) {

            console.error(error);

            msg.textContent =
                "⚠️ Reset Email পাঠানো যায়নি";

        } finally {

            forgotBtn.disabled = false;

        }

    });

}
