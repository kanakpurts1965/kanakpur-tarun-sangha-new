// =====================================================
// KTS MEMBER ADMIN SYSTEM
// ADD + EDIT + DELETE + CATEGORY + PHOTO UPLOAD
// FIRESTORE + FIREBASE STORAGE
// =====================================================


import { db, storage } from "./firebase.js";


import {

    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    updateDoc,
    deleteDoc,
    doc,
    getDocs

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


import {

    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject

} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";



// =====================================================
// FIRESTORE COLLECTION
// =====================================================


const membersRef =
    collection(db, "members");



// =====================================================
// FORM ELEMENTS
// =====================================================


const memberName =
    document.getElementById("memberName");


const memberMobile =
    document.getElementById("memberMobile");


const memberBlood =
    document.getElementById("memberBlood");


const memberPosition =
    document.getElementById("memberPosition");


const memberCategory =
    document.getElementById("memberCategory");


const memberPhotoFile =
    document.getElementById("memberPhotoFile");


const memberPhotoPreviewBox =
    document.getElementById(
        "memberPhotoPreviewBox"
    );


const memberPhotoPreview =
    document.getElementById(
        "memberPhotoPreview"
    );


const addMemberBtn =
    document.getElementById("addMemberBtn");


const adminMemberList =
    document.getElementById(
        "adminMemberList"
    );


const adminMemberSearch =
    document.getElementById(
        "adminMemberSearch"
    );



// =====================================================
// EDIT MODE VARIABLES
// =====================================================


let editingMemberId = null;


let oldPhotoURL = "";


let oldPhotoPath = "";



// =====================================================
// PHOTO PREVIEW
// =====================================================


if (memberPhotoFile) {


    memberPhotoFile.addEventListener(

        "change",

        () => {


            const file =
                memberPhotoFile.files[0];


            if (!file) {


                memberPhotoPreviewBox.style.display =
                    "none";


                return;

            }


            const reader =
                new FileReader();


            reader.onload = (event) => {


                memberPhotoPreview.src =
                    event.target.result;


                memberPhotoPreviewBox.style.display =
                    "block";

            };


            reader.readAsDataURL(file);


        }

    );

}



// =====================================================
// GET NEXT DATABASE SERIAL
// =====================================================


async function getNextSerial() {


    const snapshot =
        await getDocs(membersRef);


    let highestSerial = 0;


    snapshot.forEach((memberDoc) => {


        const data =
            memberDoc.data();


        const serial =
            Number(data.serial) || 0;


        if (serial > highestSerial) {


            highestSerial = serial;

        }


    });


    return highestSerial + 1;

}



// =====================================================
// PHOTO UPLOAD FUNCTION
// =====================================================


async function uploadMemberPhoto(file) {


    const safeName =
        file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const uniqueName =

        Date.now()

        + "_"

        + safeName;


    const photoPath =

        "members/"

        + uniqueName;


    const photoRef =
        ref(storage, photoPath);


    await uploadBytes(
        photoRef,
        file
    );


    const photoURL =
        await getDownloadURL(photoRef);


    return {

        photoURL,

        photoPath

    };

}



// =====================================================
// SAVE / UPDATE MEMBER
// =====================================================


if (addMemberBtn) {


    addMemberBtn.addEventListener(

        "click",

        async () => {


            const name =
                memberName.value.trim();


            const mobile =
                memberMobile.value.trim();


            const bloodGroup =
                memberBlood.value;


            const position =
                memberPosition.value;


            const category =
                memberCategory.value;


            const selectedPhoto =
                memberPhotoFile.files[0];



            // ==========================================
            // VALIDATION
            // ==========================================


            if (name === "") {


                alert(
                    "❌ সদস্যের নাম লিখুন"
                );


                memberName.focus();


                return;

            }


            if (mobile === "") {


                alert(
                    "❌ মোবাইল নম্বর লিখুন"
                );


                memberMobile.focus();


                return;

            }


            if (bloodGroup === "") {


                alert(
                    "❌ Blood Group নির্বাচন করুন"
                );


                return;

            }


            if (position === "") {


                alert(
                    "❌ সদস্যের পদ নির্বাচন করুন"
                );


                return;

            }


            if (category === "") {


                alert(
                    "❌ কার্যকরী সদস্য অথবা সকল সদস্য নির্বাচন করুন"
                );


                return;

            }



            // নতুন Member হলে Photo বাধ্যতামূলক নয়।
            // Photo না দিলে member.png থাকবে।


            try {


                addMemberBtn.disabled = true;


                addMemberBtn.innerText =
                    editingMemberId
                        ? "⏳ Updating..."
                        : "⏳ Saving...";



                // ======================================
                // DEFAULT PHOTO VALUES
                // ======================================


                let finalPhotoURL =

                    oldPhotoURL

                    ||

                    "member.png";


                let finalPhotoPath =

                    oldPhotoPath

                    ||

                    "";



                // ======================================
                // UPLOAD NEW PHOTO
                // ======================================


                if (selectedPhoto) {


                    const uploadedPhoto =
                        await uploadMemberPhoto(
                            selectedPhoto
                        );


                    finalPhotoURL =
                        uploadedPhoto.photoURL;


                    finalPhotoPath =
                        uploadedPhoto.photoPath;

                }



                // ======================================
                // EDIT MEMBER
                // ======================================


                if (editingMemberId) {


                    await updateDoc(

                        doc(

                            db,

                            "members",

                            editingMemberId

                        ),

                        {

                            name: name,

                            mobile: mobile,

                            bloodGroup:
                                bloodGroup,

                            position:
                                position,

                            category:
                                category,

                            photo:
                                finalPhotoURL,

                            photoPath:
                                finalPhotoPath,

                            updatedAt:
                                serverTimestamp()

                        }

                    );



                    // পুরোনো Storage Photo Delete
                    // নতুন Photo নির্বাচন করলে


                    if (

                        selectedPhoto

                        &&

                        oldPhotoPath

                        &&

                        oldPhotoPath !==
                            finalPhotoPath

                    ) {


                        try {


                            const oldRef =
                                ref(
                                    storage,
                                    oldPhotoPath
                                );


                            await deleteObject(
                                oldRef
                            );


                        }

                        catch (error) {


                            console.warn(
                                "Old photo delete skipped:",
                                error
                            );


                        }


                    }


                    alert(
                        "✅ সদস্যের তথ্য Update হয়েছে"
                    );


                }



                // ======================================
                // ADD NEW MEMBER
                // ======================================


                else {


                    const nextSerial =
                        await getNextSerial();


                    await addDoc(

                        membersRef,

                        {

                            name:
                                name,

                            mobile:
                                mobile,

                            bloodGroup:
                                bloodGroup,

                            position:
                                position,

                            category:
                                category,

                            photo:
                                finalPhotoURL,

                            photoPath:
                                finalPhotoPath,

                            serial:
                                nextSerial,

                            createdAt:
                                serverTimestamp()

                        }

                    );


                    alert(
                        "✅ সদস্য সফলভাবে যোগ হয়েছে"
                    );


                }



                // ======================================
                // CLEAR FORM
                // ======================================


                clearMemberForm();


            }


            catch (error) {


                console.error(
                    "Member Save Error:",
                    error
                );


                alert(
                    "❌ Member Save / Update করা যায়নি"
                );


            }


            finally {


                addMemberBtn.disabled =
                    false;


                addMemberBtn.innerText =
                    "💾 সদস্য Save করুন";


            }


        }

    );

}



// =====================================================
// CLEAR FORM
// =====================================================


function clearMemberForm() {


    memberName.value = "";


    memberMobile.value = "";


    memberBlood.value = "";


    memberPosition.value = "";


    memberCategory.value = "";


    memberPhotoFile.value = "";


    memberPhotoPreview.src = "";


    memberPhotoPreviewBox.style.display =
        "none";


    editingMemberId = null;


    oldPhotoURL = "";


    oldPhotoPath = "";


    addMemberBtn.innerText =
        "💾 সদস্য Save করুন";

}



// =====================================================
// REAL-TIME ADMIN MEMBER LIST
// =====================================================


if (adminMemberList) {


    const memberQuery =
        query(

            membersRef,

            orderBy(
                "serial",
                "asc"
            )

        );


    onSnapshot(

        memberQuery,


        (snapshot) => {


            adminMemberList.innerHTML =
                "";


            if (snapshot.empty) {


                adminMemberList.innerHTML = `

                    <p class="member-loading">

                        কোনো সদস্য পাওয়া যায়নি।

                    </p>

                `;


                return;

            }



            // Firestore snapshot.forEach index দেয় না।
            // তাই আলাদা display serial ব্যবহার করা হচ্ছে।


            let displaySerial = 1;



            snapshot.forEach((item) => {


                const data =
                    item.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-member-card";



                const categoryText =

                    data.category ===
                    "executive"

                    ? "⭐ কার্যকরী সদস্য"

                    : "👥 সকল সদস্য";



                const serialText =
                    String(
                        displaySerial++
                    ).padStart(
                        3,
                        "0"
                    );



                card.innerHTML = `


                    <div class="admin-member-serial">

                        ${serialText}

                    </div>



                    <img

                        src="${data.photo || "member.png"}"

                        class="admin-member-photo"

                        alt="Member Photo"

                        onerror="this.src='member.png'"

                    >



                    <div class="admin-member-info">


                        <h4>

                            ${data.name || ""}

                        </h4>


                        <p>

                            📞 ${data.mobile || ""}

                        </p>


                        <p>

                            🩸 ${data.bloodGroup || ""}

                        </p>


                        <p>

                            👔 ${data.position || ""}

                        </p>


                        <p>

                            ${categoryText}

                        </p>


                    </div>



                    <div class="admin-member-actions">


                        <button

                            class="edit-member-btn"

                            data-id="${item.id}"

                            data-name="${data.name || ""}"

                            data-mobile="${data.mobile || ""}"

                            data-blood="${data.bloodGroup || ""}"

                            data-position="${data.position || ""}"

                            data-category="${data.category || "general"}"

                            data-photo="${data.photo || "member.png"}"

                            data-photo-path="${data.photoPath || ""}"

                        >

                            ✏️ Edit

                        </button>



                        <button

                            class="delete-member-btn"

                            data-id="${item.id}"

                            data-name="${data.name || ""}"

                            data-photo-path="${data.photoPath || ""}"

                        >

                            🗑️ Delete

                        </button>


                    </div>


                `;


                adminMemberList.appendChild(
                    card
                );


            });


        },


        (error) => {


            console.error(
                "Member Load Error:",
                error
            );


            adminMemberList.innerHTML = `

                <p class="member-loading">

                    ❌ সদস্য তালিকা Load করা যায়নি।

                </p>

            `;


        }

    );


}



// =====================================================
// EDIT MEMBER
// =====================================================


document.addEventListener(

    "click",

    (event) => {


        const editBtn =
            event.target.closest(
                ".edit-member-btn"
            );


        if (!editBtn) return;



        editingMemberId =
            editBtn.dataset.id;


        oldPhotoURL =
            editBtn.dataset.photo;


        oldPhotoPath =
            editBtn.dataset.photoPath;



        memberName.value =
            editBtn.dataset.name;


        memberMobile.value =
            editBtn.dataset.mobile;


        memberBlood.value =
            editBtn.dataset.blood;


        memberPosition.value =
            editBtn.dataset.position;


        memberCategory.value =
            editBtn.dataset.category;



        // পুরোনো ছবি Preview


        if (

            oldPhotoURL

            &&

            oldPhotoURL !==
                "member.png"

        ) {


            memberPhotoPreview.src =
                oldPhotoURL;


            memberPhotoPreviewBox.style.display =
                "block";


        }

        else {


            memberPhotoPreviewBox.style.display =
                "none";


        }



        addMemberBtn.innerText =
            "🔄 সদস্য Update করুন";



        const formBox =
            document.querySelector(
                ".member-management-box"
            );


        if (formBox) {


            formBox.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });


        }


    }

);



// =====================================================
// DELETE MEMBER
// =====================================================


document.addEventListener(

    "click",

    async (event) => {


        const deleteBtn =
            event.target.closest(
                ".delete-member-btn"
            );


        if (!deleteBtn) return;



        const memberId =
            deleteBtn.dataset.id;


        const name =
            deleteBtn.dataset.name;


        const photoPath =
            deleteBtn.dataset.photoPath;



        const confirmDelete =
            confirm(

                `"${name}" সদস্যকে Delete করবেন?`

            );


        if (!confirmDelete) return;



        try {


            // Firestore Member Delete


            await deleteDoc(

                doc(

                    db,

                    "members",

                    memberId

                )

            );



            // Storage Photo Delete


            if (photoPath) {


                try {


                    const photoRef =
                        ref(
                            storage,
                            photoPath
                        );


                    await deleteObject(
                        photoRef
                    );


                }

                catch (error) {


                    console.warn(
                        "Photo delete skipped:",
                        error
                    );


                }


            }



            if (
                editingMemberId ===
                memberId
            ) {


                clearMemberForm();


            }



            alert(
                "✅ সদস্য সফলভাবে Delete হয়েছে"
            );


        }


        catch (error) {


            console.error(
                "Delete Error:",
                error
            );


            alert(
                "❌ Member Delete করা যায়নি"
            );


        }


    }

);



// =====================================================
// ADMIN MEMBER SEARCH
// =====================================================


if (adminMemberSearch) {


    adminMemberSearch.addEventListener(

        "input",

        () => {


            const searchValue =

                adminMemberSearch
                    .value
                    .toLowerCase()
                    .trim();



            const memberCards =

                document.querySelectorAll(
                    ".admin-member-card"
                );



            memberCards.forEach(

                (card) => {


                    const text =
                        card.innerText
                            .toLowerCase();


                    card.style.display =

                        text.includes(
                            searchValue
                        )

                        ? "flex"

                        : "none";


                }

            );


        }

    );

}
