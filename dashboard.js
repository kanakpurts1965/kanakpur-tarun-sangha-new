import { db, auth } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


const ADMIN_EMAIL = "tanmoyadak112@gmail.com";


/* ==========================================
   SECURE ADMIN AUTH GUARD
========================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace("admin.html");
        return;

    }

    if (user.email !== ADMIN_EMAIL) {

        signOut(auth).then(() => {

            window.location.replace("admin.html");

        });

        return;

    }

    document.body.classList.add("admin-auth-ready");

});


/* ==========================================
   SECURE LOGOUT
========================================== */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.replace("admin.html");

        } catch (error) {

            console.error("Logout Error:", error);

            alert("Logout করা যায়নি। আবার চেষ্টা করুন।");

        }

    });

}


// ==========================================
// KTS ADMIN DASHBOARD SPA MENU
// Phase 1 - Part 3
// ==========================================

const spaPages = document.querySelectorAll(".page");

const spaMenus = {
    menuDashboard: "dashboardPage",
    menuComments: "commentsPage",
    menuReplies: "repliesPage",
    menuMembers: "membersPage",
    menuAccounts: "accountsPage",
    menuNotice: "noticePage",
    menuGallery: "galleryPage",
    menuEvent: "eventPage",
    menuContact: "contactPage",
    menuSettings: "settingsPage"
};


// ==========================================
// SHOW PAGE
// ==========================================

function showAdminPage(pageId) {

    spaPages.forEach((page) => {

        page.classList.remove("active");

    });


    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }

  const accountPages = [
    "accountsPage",
    "programsPage",
    "creditPage",
    "debitPage",
    "contractPage"
];

    document.body.classList.toggle(
        "accounts-mode",
        accountPages.includes(pageId)
    );

}


// ==========================================
// MENU CLICK SYSTEM
// ==========================================

Object.entries(spaMenus).forEach(([menuId, pageId]) => {

    const menu = document.getElementById(menuId);

    if (menu) {

        menu.addEventListener("click", () => {

            showAdminPage(pageId);

        });

    }

});
/* =====================================================
   ADMIN CHANGE PASSWORD
===================================================== */

import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


const changePasswordBtn =
    document.getElementById("changeAdminPasswordBtn");


if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        async () => {

            const currentPassword =
                document
                    .getElementById("currentAdminPassword")
                    .value;

            const newPassword =
                document
                    .getElementById("newAdminPassword")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmAdminPassword")
                    .value;

            const message =
                document.getElementById("passwordChangeMsg");


            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                message.textContent =
                    "⚠️ সব ঘর পূরণ করুন।";

                return;
            }


            if (newPassword.length < 8) {

                message.textContent =
                    "⚠️ নতুন Password কমপক্ষে 8 অক্ষরের দিন।";

                return;
            }


            if (newPassword !== confirmPassword) {

                message.textContent =
                    "❌ নতুন Password দুটি মিলছে না।";

                return;
            }


            try {

                changePasswordBtn.disabled = true;

                message.textContent =
                    "⏳ Password পরিবর্তন হচ্ছে...";


                const user = auth.currentUser;


                if (!user || !user.email) {

                    message.textContent =
                        "❌ Admin session পাওয়া যায়নি।";

                    return;
                }


                const credential =
                    EmailAuthProvider.credential(

                        user.email,

                        currentPassword

                    );


                await reauthenticateWithCredential(

                    user,

                    credential

                );


                await updatePassword(

                    user,

                    newPassword

                );


                document
                    .getElementById("currentAdminPassword")
                    .value = "";

                document
                    .getElementById("newAdminPassword")
                    .value = "";

                document
                    .getElementById("confirmAdminPassword")
                    .value = "";


                message.textContent =
                    "✅ Password সফলভাবে পরিবর্তন হয়েছে।";


            } catch (error) {

                console.error(
                    "PASSWORD CHANGE ERROR:",
                    error
                );


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message.textContent =
                        "❌ বর্তমান Password ভুল।";

                } else {

                    message.textContent =
                        "❌ Password পরিবর্তন করা যায়নি।";

                }

            } finally {

                changePasswordBtn.disabled = false;

            }

        }

    );

}

/* ==========================================
   Accounts Center Navigation
========================================== */

document.querySelectorAll("[data-account-page]").forEach((button)=>{

    button.addEventListener("click",()=>{

        showAdminPage(button.dataset.accountPage);

    });

});


document.querySelectorAll(".back-to-accounts").forEach((button)=>{

    button.addEventListener("click",()=>{

        showAdminPage("accountsPage");

    });

});


/* Default */

showAdminPage("dashboardPage");

/* ==========================================
   OPEN PAGE FROM URL
========================================== */

const params = new URLSearchParams(window.location.search);

const openPage = params.get("open");

if (openPage === "accounts") {

    showAdminPage("accountsPage");

}
/* ==========================================
   OPEN ACCOUNTS SUB PAGE
========================================== */

if (openPage === "statement") {

    showAdminPage("accountsPage");

    setTimeout(() => {

        document.querySelectorAll(".accounts-center-card")
        .forEach(card => card.classList.remove("active-tool"));

        const statementCard = [...document.querySelectorAll(".accounts-center-card")]
            .find(card =>
                card.textContent.includes("Total Account Statement")
            );

        if (statementCard) {

            statementCard.classList.add("active-tool");

        }

    }, 100);

}
