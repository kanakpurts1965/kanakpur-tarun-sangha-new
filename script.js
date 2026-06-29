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
   SECRET ADMIN (5 DOUBLE CLICK)
========================================== */

const topLogo = document.getElementById("topLogo");

let clickCount = 0;
let clickTimeout;

if (topLogo) {

    topLogo.addEventListener("dblclick", () => {

        clickCount++;

        clearTimeout(clickTimeout);

        clickTimeout = setTimeout(() => {

            clickCount = 0;

        }, 3000);

        if (clickCount >= 5) {

            clickCount = 0;

            window.location.href = "admin.html";

        }

    });

}
/* ==========================================
   SECRET ADMIN (CTRL + SHIFT + A)
========================================== */

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {

        e.preventDefault();

        window.location.href = "admin.html";

    }

});

console.log("Kanakpur Tarun Sangha Website v5.0 Loaded Successfully"); 

