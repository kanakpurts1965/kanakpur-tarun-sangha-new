window.addEventListener("load", () => {

    document.body.classList.add("show");

    setTimeout(() => {
        document.body.classList.add("hide");
    }, 2500);

    setTimeout(() => {
        window.location.replace("index.html");
    }, 3200);

});
