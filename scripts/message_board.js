const scrollToTop = document.getElementById("scroll-to-top");
const cardContainer = document.getElementById("card-container");

scrollToTop.addEventListener("click", () => {
    cardContainer.scrollTop = 0;
})
