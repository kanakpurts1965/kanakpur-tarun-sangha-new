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
// MEMBER LIST PDF / PRINT — BANGLA SUPPORTED
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

      members.sort((a, b) =>
        (Number(a.serial) || 0) -
        (Number(b.serial) || 0)
      );

      if (!members.length) {
        alert("কোনো সদস্য নেই।");
        return;
      }


      // SAFE HTML
      function escapeHTML(value = "") {

        return String(value)

          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }


      // TABLE ROWS

      const rows = members.map((member, index) => {

        return `
          <tr>

            <td>
              ${String(index + 1).padStart(3, "0")}
            </td>

            <td>
              ${escapeHTML(member.name || "")}
            </td>

            <td>
              ${escapeHTML(member.mobile || "")}
            </td>

            <td>
              ${escapeHTML(member.bloodGroup || "")}
            </td>

            <td>
              ${escapeHTML(member.position || "")}
            </td>

          </tr>
        `;

      }).join("");


      // PRINT WINDOW

      const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );


      if (!printWindow) {

        alert(
          "Popup blocked হয়েছে। Browser থেকে popup allow করুন।"
        );

        return;
      }


      printWindow.document.open();


      printWindow.document.write(`

<!DOCTYPE html>

<html lang="bn">

<head>

<meta charset="UTF-8">

<title>
কনকপুর তরুণ সংঘ - সদস্য তালিকা
</title>


<style>

@page {

  size: A4 portrait;

  margin: 10mm;

}


* {

  box-sizing: border-box;

}


body {

  margin: 0;

  color: #111;

  font-family:
    "Noto Sans Bengali",
    "Hind Siliguri",
    "SolaimanLipi",
    "Kalpurush",
    Arial,
    sans-serif;

}


.header {

  text-align: center;

  margin-bottom: 20px;

}


.header h1 {

  margin: 0;

  font-size: 28px;

  color: #8b0000;

}


.header h2 {

  margin: 8px 0 4px;

  font-size: 21px;

}


.header p {

  margin: 0;

  font-size: 13px;

}


table {

  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;

}


thead {

  display: table-header-group;

}


tr {

  page-break-inside: avoid;

}


th,
td {
  border: 1px solid #222;
  padding: 6px 4px;
  font-size: 10px;
  vertical-align: middle;
  overflow-wrap: break-word;
  word-break: break-word;
}

th:nth-child(1),
td:nth-child(1) {
  width: 9%;
  text-align: center;
}

th:nth-child(2),
td:nth-child(2) {
  width: 25%;
}

th:nth-child(3),
td:nth-child(3) {
  width: 22%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 14%;
  text-align: center;
}

th:nth-child(5),
td:nth-child(5) {
  width: 30%;
}


.total {

  margin-top: 12px;

  font-size: 14px;

  font-weight: 700;

}


@media print {

  body {

    -webkit-print-color-adjust: exact;

    print-color-adjust: exact;

  }

}

</style>

</head>


<body>


<div class="header">

  <h1>
    কনকপুর তরুণ সংঘ
  </h1>

  <h2>
    সদস্য তালিকা
  </h2>

  <p>
    প্রতিষ্ঠিত: ১৯৬৫
  </p>

</div>


<table>

<thead>

<tr>

  <th>
    ক্রমিক নং
  </th>

  <th>
    সদস্যের নাম
  </th>

  <th>
    মোবাইল নম্বর
  </th>

  <th>
    রক্তের গ্রুপ
  </th>

  <th>
    সদস্যের পদ
  </th>

</tr>

</thead>


<tbody>

${rows}

</tbody>

</table>


<div class="total">

মোট সদস্য: ${members.length}

</div>


<script>

window.onload = function() {

  setTimeout(function() {

    window.print();

  }, 500);

};

<\/script>


</body>

</html>

      `);


      printWindow.document.close();


    }

    catch (error) {

      console.error(
        "MEMBER PDF ERROR:",
        error
      );

      alert(
        "PDF তৈরি হয়নি: " +
        error.message
      );

    }

  });
