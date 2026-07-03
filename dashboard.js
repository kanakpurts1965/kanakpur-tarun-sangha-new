import { db } from "./firebase.js";

import {
    collection, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Security Check
if(localStorage.getItem("adminLoggedIn")!=="true"){
    window.location.href="admin.html";
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
