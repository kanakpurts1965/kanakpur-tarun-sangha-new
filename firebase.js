// ==========================================
// FIREBASE CONFIGURATION
// FIRESTORE + STORAGE
// ==========================================


// Firebase App

import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";


// Firestore

import {

    getFirestore

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// Firebase Storage

import {

    getStorage

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";



// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCSxn1dAA708KyKOfrLP_nTrBnazrFjPT8",

    authDomain:
        "kanakpur-tarun-sangha-42e7b.firebaseapp.com",

    projectId:
        "kanakpur-tarun-sangha-42e7b",

    storageBucket:
        "kanakpur-tarun-sangha-42e7b.firebasestorage.app",

    messagingSenderId:
        "1062615905207",

    appId:
        "1:1062615905207:web:53e520f0696aeb0daa6e32"

};



// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(firebaseConfig);



// ==========================================
// INITIALIZE FIRESTORE
// ==========================================

const db =
    getFirestore(app);



// ==========================================
// INITIALIZE STORAGE
// ==========================================

const storage =
   // ==========================================
// EXPORT FIREBASE SERVICES
// ==========================================

export {
    db,
    storage
};
