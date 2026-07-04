// =====================================================
// KTS MEMBER ADMIN SYSTEM
// CLOUDINARY + FIRESTORE
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
// CONFIG
// =====================================================

const CLOUD_NAME = "wf6ocs3j";
const UPLOAD_PRESET = "kts_members";

const membersRef = collection(db, "members");


// =====================================================
// ELEMENTS
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

const chooseMemberPhotoBtn =
    document.getElementById("chooseMemberPhotoBtn");

const memberPhotoFileName =
    document.getElementById("memberPhotoFileName");

chooseMemberPhotoBtn?.addEventListener("click", () => {
    memberPhotoFile?.click();
});


// =====================================================
// EDIT DATA
// =====================================================

let editingMemberId = null;
let oldPhotoURL = "";
let oldPhotoPublicId = "";


// =====================================================
// PHOTO PREVIEW
// =====================================================

memberPhotoFile?.addEventListener("change", () => {

    const file = memberPhotoFile.files[0];

    if (memberPhotoFileName) {
        memberPhotoFileName.textContent =
            file ? file.name : "কোনো ছবি নির্বাচন করা হয়নি";
    }

    if (!file) {

        memberPhotoPreview.src = "";

        memberPhotoPreviewBox.style.display = "none";

        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("শুধু ছবি নির্বাচন করুন");

        memberPhotoFile.value = "";

        return;
    }


    if (file.size > 5 * 1024 * 1024) {

        alert("ছবির Size 5MB-এর কম রাখুন");

        memberPhotoFile.value = "";

        return;
    }


    memberPhotoPreview.src =
        URL.createObjectURL(file);

    memberPhotoPreviewBox.style.display =
        "block";

});


// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

async function uploadPhoto(file) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const url =
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


    const controller =
        new AbortController();


    const timeout =
        setTimeout(() => {

            controller.abort();

        }, 30000);


    try {

        const response = await fetch(url, {

            method: "POST",

            body: formData,

            signal: controller.signal

        });


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result?.error?.message ||
                "Cloudinary Upload Failed"
            );

        }


        return {

            url: result.secure_url,

            publicId: result.public_id

        };

    }

    finally {

        clearTimeout(timeout);

    }

}


// =====================================================
// NEXT SERIAL
// =====================================================

async function getNextSerial() {

    const snapshot =
        await getDocs(membersRef);


    let maxSerial = 0;


    snapshot.forEach((item) => {

        const serial =
            Number(item.data().serial) || 0;


        if (serial > maxSerial) {

            maxSerial = serial;

        }

    });


    return maxSerial + 1;

}


// =====================================================
// SAVE BUTTON
// =====================================================

addMemberBtn?.addEventListener(
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

        const photoFile =
            memberPhotoFile.files[0];


        if (!name) {

            alert("সদস্যের নাম লিখুন");

            return;
        }


        if (!mobile) {

            alert("মোবাইল নম্বর লিখুন");

            return;
        }


        if (!bloodGroup) {

            alert("Blood Group নির্বাচন করুন");

            return;
        }


        if (!position) {

            alert("পদ নির্বাচন করুন");

            return;
        }


        if (!category) {

            alert(
                "কার্যকরী সদস্য অথবা সকল সদস্য নির্বাচন করুন"
            );

            return;
        }


        try {

            addMemberBtn.disabled = true;


            let photoURL =
                oldPhotoURL || "";

            let photoPublicId =
                oldPhotoPublicId || "";


            // PHOTO UPLOAD

            if (photoFile) {

                addMemberBtn.textContent =
                    "📤 ছবি Upload হচ্ছে...";


                const uploaded =
                    await uploadPhoto(photoFile);


                photoURL =
                    uploaded.url;

                photoPublicId =
                    uploaded.publicId;

            }


            // EDIT

            if (editingMemberId) {

                addMemberBtn.textContent =
                    "⏳ Update হচ্ছে...";


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
                        photo: photoURL,
                        photoPublicId,
                        updatedAt:
                            serverTimestamp()
                    }

                );


                alert(
                    "✅ Member Update হয়েছে"
                );

            }


            // ADD

            else {

                addMemberBtn.textContent =
                    "💾 Save হচ্ছে...";


                const serial =
                    await getNextSerial();


                await addDoc(

                    membersRef,

                    {
                        name,
                        mobile,
                        bloodGroup,
                        position,
                        category,
                        photo: photoURL,
                        photoPublicId,
                        serial,
                        createdAt:
                            serverTimestamp()
                    }

                );


                alert(
                    "✅ Member Save হয়েছে"
                );

            }


            clearForm();

        }

        catch (error) {

            console.error(
                "MEMBER SAVE ERROR:",
                error
            );


            if (error.name === "AbortError") {

                alert(
                    "❌ Photo Upload Timeout হয়েছে"
                );

            }

            else {

                alert(
                    "❌ Save হয়নি: " +
                    error.message
                );

            }

        }

        finally {

            addMemberBtn.disabled = false;

            if (editingMemberId) {

                addMemberBtn.textContent =
                    "🔄 সদস্য Update করুন";

            }

            else {

                addMemberBtn.textContent =
                    "💾 সদস্য Save করুন";

            }

        }

    }
);


// =====================================================
// CLEAR FORM
// =====================================================

function clearForm() {

    memberName.value = "";

    memberMobile.value = "";

    memberBlood.value = "";

    memberPosition.value = "";

    memberCategory.value = "";

    memberPhotoFile.value = "";

    if (memberPhotoFileName) {
        memberPhotoFileName.textContent =
            "কোনো ছবি নির্বাচন করা হয়নি";
    }

    memberPhotoPreview.src = "";

    memberPhotoPreviewBox.style.display =
        "none";


    editingMemberId = null;

    oldPhotoURL = "";

    oldPhotoPublicId = "";


    addMemberBtn.textContent =
        "💾 সদস্য Save করুন";

}


// =====================================================
// ADMIN LIST
// =====================================================

const memberQuery = query(

    membersRef,

    orderBy("serial", "asc")

);


onSnapshot(

    memberQuery,

    (snapshot) => {

        if (!adminMemberList) return;


        adminMemberList.innerHTML = "";


        if (snapshot.empty) {

            adminMemberList.innerHTML =
                "<p>কোনো সদস্য নেই।</p>";

            return;
        }


        let displaySerial = 1;


        snapshot.forEach((item) => {

            const data = item.data();


            const card =
                document.createElement("div");


            card.className =
                "admin-member-card";


            card._memberData = {

                id: item.id,

                ...data

            };


            const categoryText =

                data.category === "executive"

                ? "⭐ কার্যকরী সদস্য"

                : "👥 সকল সদস্য";


            const photoHTML = data.photo

                ? `
                    <img
                        src="${data.photo}"
                        class="admin-member-photo"
                        alt="Member Photo"
                    >
                  `

                : `
                    <div class="admin-member-photo-placeholder">
                        👤
                    </div>
                  `;


            card.innerHTML = `

                <div class="admin-member-serial">
                    ${String(displaySerial++).padStart(3, "0")}
                </div>

                ${photoHTML}

                <div class="admin-member-info">

                    <h4 class="admin-member-name">
                        ${safe(data.name)}
                    </h4>

                    <div class="admin-member-meta-row">

                        <span>
                            🩸 ${safe(data.bloodGroup)}
                        </span>

                        <span>
                            👔 ${safe(data.position)}
                        </span>

                        <span>
                            ${categoryText}
                        </span>

                    </div>

                </div>

                <div class="admin-member-actions">

                    <button
                        type="button"
                        class="edit-member-btn"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="delete-member-btn"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            adminMemberList.appendChild(card);

        });

    },

    (error) => {

        console.error(
            "MEMBER LIST ERROR:",
            error
        );

    }

);


// =====================================================
// EDIT + DELETE
// =====================================================

document.addEventListener(
    "click",
    async (event) => {


        // EDIT

        const editButton =
            event.target.closest(
                ".edit-member-btn"
            );


        if (editButton) {

            const card =
                editButton.closest(
                    ".admin-member-card"
                );


            const data =
                card._memberData;


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

                memberPhotoPreviewBox.style.display =
                    "none";

            }


            addMemberBtn.textContent =
                "🔄 সদস্য Update করুন";


            document
                .querySelector(
                    ".member-management-box"
                )
                ?.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });


            return;
        }


        // DELETE

        const deleteButton =
            event.target.closest(
                ".delete-member-btn"
            );


        if (deleteButton) {

            const card =
                deleteButton.closest(
                    ".admin-member-card"
                );


            const data =
                card._memberData;


            if (
                !confirm(
                    `"${data.name}" সদস্যকে Delete করবেন?`
                )
            ) {

                return;
            }


            try {

                deleteButton.disabled = true;

                deleteButton.textContent =
                    "⏳ Deleting...";


                await deleteDoc(

                    doc(
                        db,
                        "members",
                        data.id
                    )

                );


                if (
                    editingMemberId === data.id
                ) {

                    clearForm();

                }


                alert(
                    "✅ Member Delete হয়েছে"
                );

            }

            catch (error) {

                console.error(error);

                deleteButton.disabled = false;

                deleteButton.textContent =
                    "🗑️ Delete";

                alert(
                    "❌ Delete হয়নি"
                );

            }

        }

    }
);


// =====================================================
// ADMIN SEARCH
// =====================================================

adminMemberSearch?.addEventListener(
    "input",
    () => {


        const value =
            adminMemberSearch
                .value
                .toLowerCase()
                .trim();


        document
            .querySelectorAll(
                ".admin-member-card"
            )
            .forEach((card) => {


                card.style.display =

                    card.innerText
                        .toLowerCase()
                        .includes(value)

                    ? "grid"

                    : "none";

            });

    }
);


// =====================================================
// SAFE TEXT
// =====================================================

function safe(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}

// =====================================================
// MEMBER LIST PDF DOWNLOAD — TABLE FORMAT
// =====================================================

document
  .getElementById("downloadMemberPdf")
  ?.addEventListener("click", async () => {

    try {

      const snapshot = await getDocs(membersRef);

      const members = [];

      snapshot.forEach((item) => {
        members.push(item.data());
      });


      // SERIAL অনুযায়ী SORT

      members.sort((a, b) =>
        (Number(a.serial) || 0) -
        (Number(b.serial) || 0)
      );


      if (!members.length) {

        alert("কোনো সদস্য নেই।");

        return;

      }


      if (!window.jspdf?.jsPDF) {

        alert("PDF Library Load হয়নি।");

        return;

      }


      const { jsPDF } = window.jspdf;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });


      // ==============================
      // TITLE
      // ==============================

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(20);

      pdf.text(
        "KANAKPUR TARUN SANGHA",
        148,
        16,
        { align: "center" }
      );


      pdf.setFontSize(14);

      pdf.text(
        "MEMBER LIST",
        148,
        25,
        { align: "center" }
      );


      pdf.setFontSize(9);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        "ESTD: 1965",
        148,
        31,
        { align: "center" }
      );


      // ==============================
      // TABLE SETTINGS
      // ==============================

      const startX = 10;

      let y = 40;

      const rowHeight = 10;


      // COLUMN WIDTH

      const col = {

        serial: 18,

        name: 72,

        mobile: 52,

        blood: 35,

        position: 100

      };


      const tableWidth =

        col.serial +
        col.name +
        col.mobile +
        col.blood +
        col.position;


      // ==============================
      // TABLE HEADER FUNCTION
      // ==============================

      function drawHeader() {

        let x = startX;


        pdf.setFont(
          "helvetica",
          "bold"
        );


        pdf.setFontSize(10);


        // HEADER BOXES

        pdf.rect(
          x,
          y,
          col.serial,
          rowHeight
        );

        pdf.text(
          "S/N",
          x + col.serial / 2,
          y + 6.5,
          { align: "center" }
        );

        x += col.serial;


        pdf.rect(
          x,
          y,
          col.name,
          rowHeight
        );

        pdf.text(
          "Name",
          x + 3,
          y + 6.5
        );

        x += col.name;


        pdf.rect(
          x,
          y,
          col.mobile,
          rowHeight
        );

        pdf.text(
          "Mobile Number",
          x + 3,
          y + 6.5
        );

        x += col.mobile;


        pdf.rect(
          x,
          y,
          col.blood,
          rowHeight
        );

        pdf.text(
          "Blood Group",
          x + 3,
          y + 6.5
        );

        x += col.blood;


        pdf.rect(
          x,
          y,
          col.position,
          rowHeight
        );

        pdf.text(
          "Member Position",
          x + 3,
          y + 6.5
        );


        y += rowHeight;

      }


      // FIRST PAGE HEADER

      drawHeader();


      // ==============================
      // MEMBER ROWS
      // ==============================

      pdf.setFont(
        "helvetica",
        "normal"
      );


      pdf.setFontSize(10);


      members.forEach(
        (member, index) => {


          // NEW PAGE

          if (y + rowHeight > 195) {

            pdf.addPage();

            y = 15;

            drawHeader();

            pdf.setFont(
              "helvetica",
              "normal"
            );

          }


          let x = startX;


          // SERIAL

          pdf.rect(
            x,
            y,
            col.serial,
            rowHeight
          );

          pdf.text(

            String(index + 1)
              .padStart(3, "0"),

            x + col.serial / 2,

            y + 6.5,

            {
              align: "center"
            }

          );

          x += col.serial;


          // NAME

          pdf.rect(
            x,
            y,
            col.name,
            rowHeight
          );

          pdf.text(

            String(
              member.name || ""
            ).substring(0, 35),

            x + 3,

            y + 6.5

          );

          x += col.name;


          // MOBILE

          pdf.rect(
            x,
            y,
            col.mobile,
            rowHeight
          );

          pdf.text(

            String(
              member.mobile || ""
            ),

            x + 3,

            y + 6.5

          );

          x += col.mobile;


          // BLOOD GROUP

          pdf.rect(
            x,
            y,
            col.blood,
            rowHeight
          );

          pdf.text(

            String(
              member.bloodGroup || ""
            ),

            x + col.blood / 2,

            y + 6.5,

            {
              align: "center"
            }

          );

          x += col.blood;


          // POSITION

          pdf.rect(
            x,
            y,
            col.position,
            rowHeight
          );

          pdf.text(

            String(
              member.position || ""
            ).substring(0, 45),

            x + 3,

            y + 6.5

          );


          y += rowHeight;

        }

      );


      // ==============================
      // FOOTER
      // ==============================

      const totalPages =
        pdf.internal.getNumberOfPages();


      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {

        pdf.setPage(page);

        pdf.setFontSize(8);

        pdf.setFont(
          "helvetica",
          "normal"
        );


        pdf.text(

          `Total Members: ${members.length}`,

          10,

          205

        );


        pdf.text(

          `Page ${page} of ${totalPages}`,

          287,

          205,

          {
            align: "right"
          }

        );

      }


      // DOWNLOAD

      pdf.save(
        "KTS-Member-List.pdf"
      );


    }

    catch (error) {

      console.error(
        "PDF ERROR:",
        error
      );


      alert(
        "PDF তৈরি হয়নি: " +
        error.message
      );

    }

  });
