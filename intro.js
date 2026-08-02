window.addEventListener("load", () => {

    document.body.classList.add("show");

    setTimeout(() => {
        document.body.classList.add("hide");
    }, 2500);

    setTimeout(() => {
        window.location.replace("index.html");
    }, 3200);

});
const txt=document.getElementById("loadingText");

let i=0;

const timer=setInterval(()=>{

i++;

txt.innerHTML=`Loading... ${i}%`;

if(i>=100){

clearInterval(timer);

}

},30);
