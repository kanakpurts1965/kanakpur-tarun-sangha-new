
// ==========================================
// MEMBER SEARCH SYSTEM v1.0
// ==========================================

const memberSearch = document.getElementById("memberSearch");

if (memberSearch) {

    memberSearch.addEventListener("keyup", () => {

        const value = memberSearch.value
            .toLowerCase()
            .trim();

        const members = document.querySelectorAll(".member-row");

        members.forEach((member) => {

            const text = member.innerText.toLowerCase();

            if (text.includes(value)) {

                member.style.display = "flex";

            } else {

                member.style.display = "none";

            }

        });

    });

}
// ==========================================
// BLOOD GROUP FILTER
// ==========================================

const bloodFilter = document.getElementById("bloodFilter");

if (bloodFilter) {

    bloodFilter.addEventListener("change", () => {

        const value = bloodFilter.value.toLowerCase();

        document.querySelectorAll(".member-row").forEach((member)=>{

            const text = member.innerText.toLowerCase();

            if(value===""){

                member.style.display="flex";

            }

            else if(text.includes(value)){

                member.style.display="flex";

            }

            else{

                member.style.display="none";

            }

        });

    });

}
