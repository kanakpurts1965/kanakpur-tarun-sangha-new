// =====================================================
// KTS EVENT ADMIN SYSTEM
// ADD + EDIT + DELETE + BANNER UPLOAD
// DESCRIPTION POINTS
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// =====================================================
// CLOUDINARY CONFIG
// =====================================================

const CLOUD_NAME = "wf6ocs3j";
const UPLOAD_PRESET = "kts_members";


// =====================================================
// FIRESTORE
// =====================================================

const eventsRef =
    collection(db, "events");


// =====================================================
// ELEMENTS
// =====================================================

const eventName =
    document.getElementById("eventName");

const eventBannerFile =
    document.getElementById("eventBannerFile");

const eventBannerPreviewBox =
    document.getElementById("eventBannerPreviewBox");

const eventBannerPreview =
    document.getElementById("eventBannerPreview");

const eventDate =
    document.getElementById("eventDate");

const eventTime =
    document.getElementById("eventTime");

const eventPlace =
    document.getElementById("eventPlace");

const eventDescriptionList =
    document.getElementById("eventDescriptionList");

const addEventDescriptionBtn =
    document.getElementById("addEventDescriptionBtn");

const saveEventBtn =
    document.getElementById("saveEventBtn");

const cancelEventEditBtn =
    document.getElementById("cancelEventEditBtn");

const eventFormTitle =
    document.getElementById("eventFormTitle");

const adminEventList =
    document.getElementById("adminEventList");


// =====================================================
// EDIT STATE
// =====================================================

let editingEventId = null;

let oldBannerURL = "";

let oldBannerPublicId = "";

let selectedBannerFile = null;


// =====================================================
// BANNER SELECT + PREVIEW
// =====================================================

eventBannerFile?.addEventListener(
    "change",
    () => {

        selectedBannerFile =
            eventBannerFile.files[0] || null;


        if (!selectedBannerFile) {

            return;

        }


        eventBannerPreview.src =
            URL.createObjectURL(
                selectedBannerFile
            );


        eventBannerPreviewBox.style.display =
            "block";

    }
);


// =====================================================
// ADD DESCRIPTION POINT
// =====================================================

addEventDescriptionBtn?.addEventListener(
    "click",
    () => {

        addDescriptionRow("");

    }
);


function addDescriptionRow(value = "") {

    const row =
        document.createElement("div");


    row.className =
        "event-description-row";


    row.innerHTML = `

        <span class="event-point-number"></span>

        <input
            type="text"
            class="event-description-input"
            placeholder="বিবরণ লিখুন"
            value="${safeAttribute(value)}"
        >

        <button
            type="button"
            class="remove-event-point-btn"
            title="Remove"
        >
            ✕
        </button>

    `;


    eventDescriptionList.appendChild(row);


    updateDescriptionNumbers();

}


// =====================================================
// REMOVE DESCRIPTION POINT
// =====================================================

eventDescriptionList?.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".remove-event-point-btn"
            );


        if (!button) return;


        const rows =
            eventDescriptionList.querySelectorAll(
                ".event-description-row"
            );


        if (rows.length <= 1) {

            alert(
                "কমপক্ষে একটি Description box থাকবে।"
            );

            return;

        }


        button
            .closest(".event-description-row")
            .remove();


        updateDescriptionNumbers();

    }
);


// =====================================================
// UPDATE SERIAL NUMBERS
// =====================================================

function updateDescriptionNumbers() {

    const rows =
        eventDescriptionList.querySelectorAll(
            ".event-description-row"
        );


    rows.forEach(
        (row, index) => {

            const number =
                row.querySelector(
                    ".event-point-number"
                );


            if (number) {

                number.textContent =
                    `${index + 1}.`;

            }

        }
    );

}


// =====================================================
// GET DESCRIPTION POINTS
// =====================================================

function getDescriptionPoints() {

    return Array
        .from(
            document.querySelectorAll(
                ".event-description-input"
            )
        )

        .map(
            input =>
                input.value.trim()
        )

        .filter(Boolean);

}


// =====================================================
// CLOUDINARY BANNER UPLOAD
// =====================================================

async function uploadEventBanner(file) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );


    const response =
        await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

            {
                method: "POST",
                body: formData
            }

        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data?.error?.message ||

            "Banner Upload Failed"

        );

    }


    return {

        url:
            data.secure_url,

        publicId:
            data.public_id

    };

}


// =====================================================
// SAVE / UPDATE EVENT
// =====================================================

saveEventBtn?.addEventListener(
    "click",
    async () => {

        const name =
            eventName.value.trim();

        const date =
            eventDate.value;

        const time =
            eventTime.value;

        const place =
            eventPlace.value.trim();

        const descriptionPoints =
            getDescriptionPoints();


        if (!name) {

            alert("❌ Event Name লিখুন");

            return;

        }


        if (!date) {

            alert("❌ Event Date নির্বাচন করুন");

            return;

        }


        if (!time) {

            alert("❌ Event Time নির্বাচন করুন");

            return;

        }


        if (!place) {

            alert("❌ Event Place লিখুন");

            return;

        }


        if (!editingEventId && !selectedBannerFile) {

            alert(
                "❌ Event Banner নির্বাচন করুন"
            );

            return;

        }


        if (!descriptionPoints.length) {

            alert(
                "❌ অন্তত একটি Description লিখুন"
            );

            return;

        }


        try {

            saveEventBtn.disabled =
                true;


            saveEventBtn.textContent =
                "⏳ Processing...";


            let bannerURL =
                oldBannerURL;

            let bannerPublicId =
                oldBannerPublicId;


            // NEW BANNER SELECTED

            if (selectedBannerFile) {

                saveEventBtn.textContent =
                    "📤 Banner Upload হচ্ছে...";


                const uploaded =
                    await uploadEventBanner(
                        selectedBannerFile
                    );


                bannerURL =
                    uploaded.url;

                bannerPublicId =
                    uploaded.publicId;

            }


            const eventData = {

                name,

                bannerURL,

                bannerPublicId,

                date,

                time,

                place,

                descriptionPoints,

                updatedAt:
                    serverTimestamp()

            };


            // EDIT MODE

            if (editingEventId) {

                await updateDoc(

                    doc(
                        db,
                        "events",
                        editingEventId
                    ),

                    eventData

                );


                alert(
                    "✅ Event Update হয়েছে"
                );

            }


            // NEW EVENT

            else {

                await addDoc(

                    eventsRef,

                    {

                        ...eventData,

                        createdAt:
                            serverTimestamp()

                    }

                );


                alert(
                    "✅ নতুন Event তৈরি হয়েছে"
                );

            }


            clearEventForm();

        }

        catch (error) {

            console.error(
                "EVENT SAVE ERROR:",
                error
            );


            alert(

                "❌ Event Save হয়নি: " +

                error.message

            );

        }

        finally {

            saveEventBtn.disabled =
                false;


            saveEventBtn.textContent =
                "💾 Event Save করুন";

        }

    }
);


// =====================================================
// EVENT QUERY
// =====================================================

const eventQuery =
    query(

        eventsRef,

        orderBy(
            "createdAt",
            "desc"
        )

    );


// =====================================================
// ADMIN EVENT LIST
// =====================================================

onSnapshot(

    eventQuery,

    (snapshot) => {

        if (!adminEventList) return;


        adminEventList.innerHTML = "";


        if (snapshot.empty) {

            adminEventList.innerHTML = `

                <p>
                    বর্তমানে কোনো Event নেই।
                </p>

            `;

            return;

        }


        snapshot.forEach(
            (item) => {

                const data =
                    item.data();


                const card =
                    document.createElement("div");


                card.className =
                    "admin-event-card";


                const pointsHTML =

                    (data.descriptionPoints || [])

                    .map(

                        (point, index) => `

                            <li>
                                ${safe(point)}
                            </li>

                        `

                    )

                    .join("");


                card.innerHTML = `

                    <h3>
                        ${safe(data.name || "")}
                    </h3>


                    <img
                        src="${safeAttribute(
                            data.bannerURL || ""
                        )}"
                        alt="Event Banner"
                        class="admin-event-banner"
                    >


                    <div class="admin-event-meta">

                        <span>
                            📅 ${safe(data.date || "")}
                        </span>

                        <span>
                            ⏰ ${safe(data.time || "")}
                        </span>

                    </div>


                    <p>
                        📍 ${safe(data.place || "")}
                    </p>


                    <ol>
                        ${pointsHTML}
                    </ol>


                    <div class="admin-event-actions">

                        <button
                            type="button"
                            class="edit-event-btn"
                            data-id="${item.id}"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            type="button"
                            class="delete-event-btn"
                            data-id="${item.id}"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;


                // STORE EVENT DATA

                card.dataset.eventData =
                    JSON.stringify({

                        id:
                            item.id,

                        name:
                            data.name || "",

                        bannerURL:
                            data.bannerURL || "",

                        bannerPublicId:
                            data.bannerPublicId || "",

                        date:
                            data.date || "",

                        time:
                            data.time || "",

                        place:
                            data.place || "",

                        descriptionPoints:
                            data.descriptionPoints || []

                    });


                adminEventList.appendChild(card);

            });

    },

    (error) => {

        console.error(
            "EVENT LIST ERROR:",
            error
        );


        if (adminEventList) {

            adminEventList.innerHTML = `

                <p>
                    ❌ Event List Load হয়নি।
                </p>

            `;

        }

    }

);


// =====================================================
// EDIT EVENT
// =====================================================

adminEventList?.addEventListener(
    "click",
    (event) => {

        const editButton =
            event.target.closest(
                ".edit-event-btn"
            );


        if (!editButton) return;


        const card =
            editButton.closest(
                ".admin-event-card"
            );


        if (!card) return;


        const data =
            JSON.parse(
                card.dataset.eventData
            );


        editingEventId =
            data.id;


        oldBannerURL =
            data.bannerURL;


        oldBannerPublicId =
            data.bannerPublicId;


        selectedBannerFile =
            null;


        eventName.value =
            data.name;


        eventDate.value =
            data.date;


        eventTime.value =
            data.time;


        eventPlace.value =
            data.place;


        // OLD BANNER PREVIEW

        if (data.bannerURL) {

            eventBannerPreview.src =
                data.bannerURL;


            eventBannerPreviewBox.style.display =
                "block";

        }


        // DESCRIPTION POINTS

        eventDescriptionList.innerHTML =
            "";


        const points =
            data.descriptionPoints.length

                ? data.descriptionPoints

                : [""];


        points.forEach(
            point => {

                addDescriptionRow(point);

            }
        );


        eventFormTitle.textContent =
            "✏️ Event Edit করুন";


        saveEventBtn.textContent =
            "💾 Event Update করুন";


        cancelEventEditBtn.style.display =
            "block";


        document
            .getElementById("eventPage")
            ?.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

    }
);


// =====================================================
// DELETE EVENT
// =====================================================

adminEventList?.addEventListener(
    "click",
    async (event) => {

        const deleteButton =
            event.target.closest(
                ".delete-event-btn"
            );


        if (!deleteButton) return;


        const confirmed =
            confirm(
                "এই Event Delete করবেন?"
            );


        if (!confirmed) return;


        try {

            deleteButton.disabled =
                true;


            deleteButton.textContent =
                "⏳ Deleting...";


            await deleteDoc(

                doc(
                    db,
                    "events",
                    deleteButton.dataset.id
                )

            );


            alert(
                "✅ Event Delete হয়েছে"
            );

        }

        catch (error) {

            console.error(
                "EVENT DELETE ERROR:",
                error
            );


            deleteButton.disabled =
                false;


            deleteButton.textContent =
                "🗑️ Delete";


            alert(

                "❌ Delete হয়নি: " +

                error.message

            );

        }

    }
);


// =====================================================
// CANCEL EDIT
// =====================================================

cancelEventEditBtn?.addEventListener(
    "click",
    () => {

        clearEventForm();

    }
);


// =====================================================
// CLEAR EVENT FORM
// =====================================================

function clearEventForm() {

    editingEventId =
        null;


    oldBannerURL =
        "";


    oldBannerPublicId =
        "";


    selectedBannerFile =
        null;


    eventName.value =
        "";


    eventBannerFile.value =
        "";


    eventDate.value =
        "";


    eventTime.value =
        "";


    eventPlace.value =
        "";


    eventBannerPreview.src =
        "";


    eventBannerPreviewBox.style.display =
        "none";


    eventDescriptionList.innerHTML =
        "";


    addDescriptionRow("");


    eventFormTitle.textContent =
        "➕ নতুন Event তৈরি করুন";


    saveEventBtn.textContent =
        "💾 Event Save করুন";


    cancelEventEditBtn.style.display =
        "none";

}


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


function safeAttribute(value = "") {

    return safe(value);

}


// INITIAL SERIAL NUMBER

updateDescriptionNumbers();
