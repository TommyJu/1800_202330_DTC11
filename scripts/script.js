
//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}

// scroll to top
const scrollToTop = document.getElementById("scroll-to-top");
const cardContainer = document.getElementById("card-container");

scrollToTop.addEventListener("click", () => {
    cardContainer.scrollTop = 0;
})