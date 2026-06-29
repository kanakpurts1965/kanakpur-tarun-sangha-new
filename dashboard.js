
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

// Logout
document.getElementById("logoutBtn").onclick=()=>{

    localStorage.removeItem("adminLoggedIn");

    window.location.href="admin.html";

};
