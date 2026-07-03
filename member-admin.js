// =====================================================
// KTS MEMBER ADMIN SYSTEM
// VERSION: CLOUDINARY + FIRESTORE
// =====================================================

import { db } from "./firebase.js";

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


// =====================================================
// CLOUDINARY CONFIG
// =====================================================

const CLOUD_NAME = "wf6ocs3j";
const UPLOAD_PRESET = "kts_members";


// =====================================================
// FIRESTORE
// =====================================================

const membersRef = collection(db, "members");


// =====================================================
// HTML ELEMENTS
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
    document.getElementById("memberPhotoPreviewBox");

const memberPhotoPreview =
    document.getElementById("memberPhotoPreview");

const addMemberBtn =
    document.getElementById("addMemberBtn");

const adminMemberList =
    document.getElementById("adminMemberList");

const adminMemberSearch =
    document.getElementById("adminMemberSearch");


// =====================================================
// EDIT MODE
// =====================================================

let editingMemberId = null;

let oldPhotoURL = "";

let oldPhotoPublicId = "";


// =====================================================
// PHOTO PREVIEW
// =====================================================

if (memberPhotoFile) {

    memberPhotoFile.addEventListener("change", () => {

        const file = memberPhotoFile.files[0];

        if (!file) {

            memberPhotoPreview.src = "";

            memberPhotoPreviewBox.style.display = "none";

            return;
        }


        // 5 MB limit

        if (file.size > 5 * 1024 * 1024) {

            alert("❌ ছবির Size 5MB-এর কম রাখুন");

            memberPhotoFile.value = "";

            memberPhotoPreviewBox.style.display = "none";

            return;
        }


        if (!file.type.startsWith("image/")) {

            alert("❌ শুধু Image File নির্বাচন করুন");

            memberPhotoFile.value = "";

            memberPhotoPreviewBox.style.display = "none";

            return;
        }


        const reader = new FileReader();

        reader.onload = (event) => {

            memberPhotoPreview.src =
                event.target.result;

            memberPhotoPreviewBox.style.display =
                "block";

        };

        reader.readAsDataURL(file);

    });

}


// =====================================================
// CLOUDINARY PHOTO UPLOAD
// =====================================================

async function uploadPhotoToCloudinary(file) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


    const response = await fetch(
        uploadURL,
        {
            method: "POST",
            body: formData
        }
    );


    const result = await response.json();


    if (!response.ok) {

        console.error(
            "Cloudinary Error:",
            result
        );

        throw new Error(
            result.error?.message ||
            "Photo upload failed"
        );
    }


    return {

        photoURL:
            result.secure_url,

        publicId:
            result.public_id

    };

}


// =====================================================
// GET NEXT SERIAL
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

            if (!name) {

                alert("❌ সদস্যের নাম লিখুন");

                memberName.focus();

                return;
            }


            if (!mobile) {

                alert("❌ মোবাইল নম্বর লিখুন");

                memberMobile.focus();

                return;
            }


            if (!bloodGroup) {

                alert("❌ Blood Group নির্বাচন করুন");

                return;
            }


            if (!position) {

                alert("❌ সদস্যের পদ নির্বাচন করুন");

                return;
            }


            if (!category) {

                alert(
                    "❌ কার্যকরী সদস্য অথবা সকল সদস্য নির্বাচন করুন"
                );

                return;
            }


            try {

                addMemberBtn.disabled = true;

                addMemberBtn.innerText =
                    editingMemberId
                        ? "⏳ Updating..."
                        : "⏳ Saving...";


                // ======================================
                // EXISTING PHOTO
                // ======================================

                let finalPhotoURL =
                    oldPhotoURL || "";

                let finalPhotoPublicId =
                    oldPhotoPublicId || "";


                // ======================================
                // NEW PHOTO UPLOAD
                // ======================================

                if (selectedPhoto) {

                    addMemberBtn.innerText =
                        "📤 Photo Upload হচ্ছে...";


                    const uploaded =
                        await uploadPhotoToCloudinary(
                            selectedPhoto
                        );


                    finalPhotoURL =
                        uploaded.photoURL;

                    finalPhotoPublicId =
                        uploaded.publicId;

                }


                // ======================================
                // EDIT MEMBER
                // ======================================

                if (editingMemberId) {

                    addMemberBtn.innerText =
                        "⏳ Updating...";


                    await updateDoc(

                        doc(
                            db,
                            "members",
                            editingMemberId
                        ),

                        {
                            name,
                            mobile,
                            bloodGroup,
                            position,
                            category,

                            photo:
                                finalPhotoURL,

                            photoPublicId:
                                finalPhotoPublicId,

                            updatedAt:
                                serverTimestamp()
                        }

                    );


                    alert(
                        "✅ সদস্যের তথ্য Update হয়েছে"
                    );

                }


                // ======================================
                // ADD MEMBER
                // ======================================

                else {

                    const nextSerial =
                        await getNextSerial();


                    addMemberBtn.innerText =
                        "💾 Member Save হচ্ছে...";


                    await addDoc(

                        membersRef,

                        {
                            name,
                            mobile,
                            bloodGroup,
                            position,
                            category,

                            photo:
                                finalPhotoURL,

                            photoPublicId:
                                finalPhotoPublicId,

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


                clearMemberForm();

            }

            catch (error) {

                console.error(
                    "Member Save Error:",
                    error
                );


                alert(
                    "❌ Save হয়নি: " +
                    error.message
                );

            }

            finally {

                addMemberBtn.disabled = false;

                if (!editingMemberId) {

                    addMemberBtn.innerText =
                        "💾 সদস্য Save করুন";

                }

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

    oldPhotoPublicId = "";


    addMemberBtn.innerText =
        "💾 সদস্য Save করুন";

}


// =====================================================
// ADMIN MEMBER LIST
// =====================================================

if (adminMemberList) {

    const memberQuery = query(

        membersRef,

        orderBy("serial", "asc")

    );


    onSnapshot(

        memberQuery,

        (snapshot) => {

            adminMemberList.innerHTML = "";


            if (snapshot.empty) {

                adminMemberList.innerHTML = `

                    <p class="member-loading">
                        কোনো সদস্য পাওয়া যায়নি।
                    </p>

                `;

                return;
            }


            let displaySerial = 1;


            snapshot.forEach((item) => {

                const data =
                    item.data();


                const card =
                    document.createElement("div");


                card.className =
                    "admin-member-card";


                const serialText =
                    String(displaySerial++)
                        .padStart(3, "0");


                const categoryText =

                    data.category === "executive"

                        ? "⭐ কার্যকরী সদস্য"

                        : "👥 সকল সদস্য";


                const photoURL =
                    data.photo || "";


                card.innerHTML = `

                    <div class="admin-member-serial">
                        ${serialText}
                    </div>


                    ${
                        photoURL

                        ? `
                        <img
                            src="${photoURL}"
                            class="admin-member-photo"
                            alt="Member Photo"
                        >
                        `

                        : `
                        <div class="admin-member-photo-placeholder">
                            👤
                        </div>
                        `
                    }


                    <div class="admin-member-info">

                        <h4>
                            ${escapeHTML(data.name || "")}
                        </h4>

                        <p>
                            📞 ${escapeHTML(data.mobile || "")}
                        </p>

                        <p>
                            🩸 ${escapeHTML(data.bloodGroup || "")}
                        </p>

                        <p>
                            👔 ${escapeHTML(data.position || "")}
                        </p>

                        <p>
                            ${categoryText}
                        </p>

                    </div>


                    <div class="admin-member-actions">

                        <button
                            class="edit-member-btn"
                            data-id="${item.id}"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="delete-member-btn"
                            data-id="${item.id}"
                            data-name="${escapeAttribute(data.name || "")}"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;


                // Store data safely on element

                card._memberData = {
                    id: item.id,
                    ...data
                };


                adminMemberList.appendChild(card);

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


        const card =
            editBtn.closest(
                ".admin-member-card"
            );


        const data =
            card._memberData;


        if (!data) return;


        editingMemberId =
            data.id;


        oldPhotoURL =
            data.photo || "";


        oldPhotoPublicId =
            data.photoPublicId || "";


        memberName.value =
            data.name || "";


        memberMobile.value =
            data.mobile || "";


        memberBlood.value =
            data.bloodGroup || "";


        memberPosition.value =
            data.position || "";


        memberCategory.value =
            data.category || "general";


        memberPhotoFile.value = "";


        if (oldPhotoURL) {

            memberPhotoPreview.src =
                oldPhotoURL;

            memberPhotoPreviewBox.style.display =
                "block";

        }

        else {

            memberPhotoPreview.src = "";

            memberPhotoPreviewBox.style.display =
                "none";

        }


        addMemberBtn.innerText =
            "🔄 সদস্য Update করুন";


        const memberForm =
            document.querySelector(
                ".member-management-box"
            );


        if (memberForm) {

            memberForm.scrollIntoView({

                behavior: "smooth",

                block: "start"

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


        const confirmDelete =
            confirm(

                `"${name}" সদস্যকে Delete করবেন?`

            );


        if (!confirmDelete) return;


        try {

            deleteBtn.disabled = true;

            deleteBtn.innerText =
                "⏳ Deleting...";


            await deleteDoc(

                doc(
                    db,
                    "members",
                    memberId
                )

            );


            if (
                editingMemberId === memberId
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


            deleteBtn.disabled = false;

            deleteBtn.innerText =
                "🗑️ Delete";


            alert(
                "❌ Delete করা যায়নি"
            );

        }

    }
);


// =====================================================
// ADMIN SEARCH
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


            const cards =

                document.querySelectorAll(
                    ".admin-member-card"
                );


            cards.forEach((card) => {

                const text =
                    card.innerText
                        .toLowerCase();


                card.style.display =

                    text.includes(searchValue)

                        ? "flex"

                        : "none";

            });

        }
    );

}


// =====================================================
// BASIC HTML SAFETY
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
