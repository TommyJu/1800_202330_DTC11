function insertNameFromFirestore() {
    // Check if the user is logged in:
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log(user.uid); // Let's know who the logged-in user is by logging their UID
            currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
            currentUser.get().then(userDoc => {
                // Get the user name
                var userName = userDoc.data().name;
                console.log(userName);
                //$("#name-goes-here").text(userName); // jQuery
                document.getElementById("name-goes-here").innerText = userName;
            })
        } else {
            console.log("No user is logged in."); // Log a message when no user is logged in
        }
    })
}
insertNameFromFirestore(); // Run the function


function displayCardsDynamically(collection) {
    let categoryTemplate = document.getElementById("category-template");
    let categoryCollection = db.collection(collection);

    categoryCollection.get()
        .then(allCategories => {
            // Create each message board post
            allCategories.forEach(doc => { //iterate thru each doc
                var title = doc.data().title;
                var description = doc.data().description;
                var image = doc.data().image;
                var docID = doc.id;

                let newcard = categoryTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                // update title, description and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-text').innerHTML = description;
                newcard.querySelector('.card-img-top').src = image;

                // Add event listener for category button
                newcard.querySelector(".card-button").addEventListener("click", () => {
                    storeCategory(title);
                });
                console.log(title)


                //attach to card-container
                // document.getElementById("card-container").prepend(newcard);
                document.getElementById("category-container").append(newcard);
            })
        })
}
displayCardsDynamically("categories");


// Will store the category to localstorage for future use
function storeCategory(value) {
    let key = "currentCategory";
    localStorage.setItem(key, value);
    console.log("cat clicked!");
};