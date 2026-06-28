/* ==========================================
   SIDEBAR
========================================== */

function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("active");
}

// Sidebar-এর বাইরে ক্লিক করলে বন্ধ হবে
document.addEventListener("click", function (e) {

    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.querySelector(".menu-btn");

    if (
        sidebar &&
        menuBtn &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        sidebar.classList.remove("active");
    }
});


/* ==========================================
   DARK MODE
========================================== */

const darkToggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    if (darkToggle) darkToggle.checked = true;
}

if (darkToggle) {

    darkToggle.addEventListener("change", function () {

        document.body.classList.toggle("dark-mode");

        localStorage.setItem(
            "darkMode",
            document.body.classList.contains("dark-mode")
        );

    });

}


/* ==========================================
   GREETING
========================================== */

function updateGreeting() {

    const hour = new Date().getHours();

    const greeting = document.getElementById("greeting");

    if (!greeting) return;

    if (hour >= 5 && hour < 12) {

        greeting.innerHTML =
            "🌞 শুভ সকাল! কনকপুর তরুণ সংঘের ওয়েবসাইটে আপনাকে স্বাগতম।";

    } else if (hour >= 12 && hour < 17) {

        greeting.innerHTML =
            "🌤️ শুভ অপরাহ্ন! আপনার দিনটি সুন্দর কাটুক।";

    } else {

        greeting.innerHTML =
            "🌙 শুভ সন্ধ্যা! আমাদের ওয়েবসাইটে আসার জন্য ধন্যবাদ।";

    }

}

updateGreeting();


/* ==========================================
   LIVE DATE & TIME
========================================== */

function updateClock() {

    const now = new Date();

    const date = now.toLocaleDateString("bn-BD", {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    });

    const time = now.toLocaleTimeString("bn-BD");

    const box = document.getElementById("liveDateTime");

    if (box) {

        box.innerHTML = "📅 " + date + " | 🕒 " + time;

    }

}

updateClock();

setInterval(updateClock, 1000);
/* ==========================================
   NOTICE TICKER
========================================== */

const noticeTrack = document.querySelector(".notice-track");

if (noticeTrack) {

    let tickerX = window.innerWidth;

    function moveTicker() {

        tickerX -= 0.5; // Speed (কম হলে আরও ধীরে চলবে)

        noticeTrack.style.transform = `translateX(${tickerX}px)`;

        if (tickerX < -noticeTrack.scrollWidth) {

            tickerX = window.innerWidth;

        }

        requestAnimationFrame(moveTicker);

    }

    moveTicker();

}


/* ==========================================
   STATISTICS COUNTER
========================================== */

let counterStarted = false;

function animateCounter(id, target, suffix = "") {

    const el = document.getElementById(id);

    if (!el) return;

    let value = 0;

    const step = Math.ceil(target / 80);

    const timer = setInterval(() => {

        value += step;

        if (value >= target) {

            value = target;

            clearInterval(timer);

        }

        el.innerHTML = value + suffix;

    }, 20);

}

const stats = document.getElementById("statistics");

if (stats) {

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting && !counterStarted) {

                counterStarted = true;

                animateCounter("yearCounter",1965);
                animateCounter("memberCounter",165,"+");
                animateCounter("eventCounter",295,"+");
                animateCounter("serviceCounter",155,"+");

            }

        });

    }, { threshold:0.4 });

    observer.observe(stats);

}


/* ==========================================
   SCROLL ANIMATION
========================================== */

const fadeItems = document.querySelectorAll("section");

const fadeObserver = new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.style.opacity="1";

            entry.target.style.transform="translateY(0)";

        }

    });

});

fadeItems.forEach(item=>{

    item.style.opacity="0";

    item.style.transform="translateY(40px)";

    item.style.transition=".8s";

    fadeObserver.observe(item);

});


/* ==========================================
   BACK TO TOP
========================================== */

const topBtn=document.getElementById("topBtn");

window.addEventListener("scroll",()=>{

    if(!topBtn) return;

    if(window.scrollY>350){

        topBtn.style.display="block";

    }else{

        topBtn.style.display="none";

    }

});

if(topBtn){

topBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

}
/* ==========================================
   GOOGLE APPS SCRIPT URL
========================================== */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby92Qi49qhcf7vVxlx_-s1I2TEWdB4ZlI5n3BgwjkVRJ4E18k4YHaZc-lXzPuYQPQ2Z/exec";


/* ==========================================
   COMMENT SUBMIT
========================================== */

const commentForm = document.getElementById("commentForm");

if (commentForm) {

    commentForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const msg = document.getElementById("msg");

        msg.innerHTML = "⏳ মন্তব্য পাঠানো হচ্ছে...";

        const formData = {

            name: document.getElementById("name").value,

            contact: document.getElementById("contact").value,

            comment: document.getElementById("comment").value,

            page: "Home"

        };

        try {

            const response = await fetch(WEB_APP_URL, {

                method: "POST",

                body: new URLSearchParams(formData)

            });

            const result = await response.json();

            if (result.success) {

                msg.innerHTML = "✅ মন্তব্য সফলভাবে পাঠানো হয়েছে।";

                commentForm.reset();

                loadComments();

            } else {

                msg.innerHTML = "❌ মন্তব্য পাঠানো যায়নি।";

            }

        } catch (err) {

            msg.innerHTML = "⚠️ Server Error.";

        }

    });

}


/* ==========================================
   LOAD RECENT COMMENTS
========================================== */

async function loadComments() {

    const container = document.getElementById("comments");

    if (!container) return;

    container.innerHTML = "⏳ মন্তব্য লোড হচ্ছে...";

    try {

        const response = await fetch(WEB_APP_URL);

        const comments = await response.json();

        if (!comments.length) {

            container.innerHTML =
                "<div class='loading-comments'>এখনও কোনো মন্তব্য নেই।</div>";

            return;

        }

        container.innerHTML = "";

        comments.forEach(item => {

            container.innerHTML += `

            <div class="comment-card">

                <div class="comment-name">

                    👤 ${item.name}

                </div>

                <div class="comment-date">

                    🕒 ${item.time}

                </div>

                <div class="comment-text">

                    ${item.comment}

                </div>

            </div>

            `;

        });

    }

    catch (err) {

        container.innerHTML =
            "<div class='loading-comments'>❌ মন্তব্য লোড করা যায়নি।</div>";

    }

}

loadComments();


/* ==========================================
   FINISHED
========================================== */

console.log("Kanakpur Tarun Sangha Website v3.0 Loaded Successfully");
