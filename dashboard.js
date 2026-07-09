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

// Collections
const commentsRef=collection(db,"comments");
const repliesRef=collection(db,"replies");

// Total Comments
onSnapshot(commentsRef,(snap)=>{

    document.getElementById("totalComments").innerHTML=snap.size;

});

// Total Replies
onSnapshot(repliesRef,(snap)=>{

    document.getElementById("totalReplies").innerHTML=snap.size;

});

// Total Likes
onSnapshot(commentsRef,(snap)=>{

    let total=0;

    snap.forEach(doc=>{
 
        total+=doc.data().likes||0;

    });

    document.getElementById("totalLikes").innerHTML=total;

});
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
