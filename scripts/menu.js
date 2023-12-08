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
                    storeCategory(docID);
                    storeCategoryTitle(title);
                });
                console.log(title)
                // Book mark button
                newcard.querySelector("i").id = 'save-' + docID;
                newcard.querySelector("i").onclick = () => updateBookmark(docID);
                // Keep bookmark active 
                let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
                currentUser.get().then(userDoc => {
                    let categories = userDoc.data().mycategories;
                    let iconID = 'save-' + docID;
                    let isBookmarked = categories.includes(docID); // check if the post is already bookmarked
                    console.log("isBookmarked", isBookmarked);
                    if (isBookmarked) {
                        document.getElementById(iconID).classList.remove("fa-regular", "fa-bookmark", "fa-2xl");
                        document.getElementById(iconID).classList.add("fa-solid", "fa-bookmark", "fa-2xl");
                    }
                })

                //attach to card-container
                document.getElementById("category-container").append(newcard);
            })
        })
}
displayCardsDynamically("categories");


// Will store useful category data to localstorage for future use
function storeCategory(value) {
    let key = "currentCategory";
    localStorage.setItem(key, value);
};

function storeCategoryTitle(value) {
    let key = "currentCategoryTitle";
    localStorage.setItem(key, value);
};

function storeCategoryImage(value) {
    let key = "newCategoryImage"
    localStorage.setItem(key, value)
}


// Bookmark a category
function updateBookmark(docID) {
    let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
    currentUser.get().then(userDoc => {
        let myCategories = userDoc.data().mycategories || {};

        let iconID = 'save-' + docID;
        let iconElement = document.getElementById(iconID);

        if (myCategories.includes(docID)) {
            currentUser.update(
                {
                    mycategories: firebase.firestore.FieldValue.arrayRemove(docID)
                }
            ).then(() => {
                console.log("Bookmark removed");
                iconElement.classList.remove("fa-solid", "fa-bookmark", "fa-2xl");
                iconElement.classList.add("fa-regular", "fa-bookmark", "fa-2xl");
            });
        } else {
            currentUser.update(
                {
                    mycategories: firebase.firestore.FieldValue.arrayUnion(docID)
                }
            ).then(() => {
                console.log("Bookmark added");
                iconElement.classList.remove("fa-regular", "fa-bookmark", "fa-2xl");
                iconElement.classList.add("fa-solid", "fa-bookmark", "fa-2xl");
            });
        }
    });
}


// Code for adding a new category -------------------------------

var userName; // create userName global variable using userID in local storage


function saveUserName() {
    var userID = localStorage.getItem("userID");
    console.log("userid from local storage:", userID);
    currentUser = db.collection("users").doc(userID); // Go to the Firestore document of the user
    currentUser.get().then(userDoc => {
        // Get the user name
        userName = userDoc.data().name; // overwrite global variable
        console.log("from saveUserName:", userName);
        // Add user name to html
    })
}
saveUserName();


function saveCategoryIDforUser(categoryDocID) {
    firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("categorydoc id is: " + categoryDocID);
        db.collection("users").doc(user.uid).update({
            mycategories: firebase.firestore.FieldValue.arrayUnion(categoryDocID)
        })
            .then(() => {
                console.log("5. Saved to user's document!");
                //window.location.href = "showposts.html";
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    })
}


var categoryImageUrl; // global variable for adding image to first post when creating a new category


function uploadPic(categoryDocID) {
    console.log("inside uploadPic " + categoryDocID);

    let categoriesCollection = db.collection("categories");
    var fileExtension = ImageFile.name.split('.').pop(); // returns file extension
    var storageRef = storage.ref("images/" + categoryDocID + "." + fileExtension); // store image with any file extension

    storageRef.put(ImageFile)   //global variable ImageFile
        .then(() => {
            console.log('2. Uploaded to Cloud Storage.');
            storageRef.getDownloadURL()

                // AFTER .getDownloadURL is done
                .then(function (url) { // Get URL of the uploaded file
                    console.log("3. Got the download URL.");
                    // Store the result in local storage for creating the first post in collection
                    storeCategoryImage(url);


                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    categoriesCollection.doc(categoryDocID).update({
                        "image": url // Save the URL into users collection
                    })
                    
                        // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                        })
                })
        })
        .catch((error) => {
            console.log("error uploading to cloud storage");
        })
}


var ImageFile;


// Change media preview on file upload
function listenFileSelect() {
    // listen for file selection
    var fileInput = document.getElementById("media-input"); // pointer #1
    const image = document.getElementById("media"); // pointer #2

    // When a change happens to the File Chooser Input
    fileInput.addEventListener('change', function (e) {
        ImageFile = e.target.files[0];   //Global variable
        var blob = URL.createObjectURL(ImageFile);
        image.src = blob; // Display this image
    })
}
listenFileSelect();


document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('myform');

    form.addEventListener('submit', function (e) {
        e.preventDefault();


        // This authentication state listener should be registered once, not on every form submit.
        // If needed, place this listener outside and use a variable to store the user state.
        firebase.auth().onAuthStateChanged(async function (user) {
            if (user) {
                // current Category is a local variable
                let categoriesCollection = db.collection("categories");
                var userId = user.uid;
                var title = document.getElementById('title').value;
                var description = document.getElementById('description').value;

                var categoryData = {
                    date: new Date().toLocaleDateString(),
                    title: title,
                    description: description,
                    userId: userId,
                    userName: userName, // global variable
                    last_updated: firebase.firestore.FieldValue
                        .serverTimestamp() //current system time
                    // The URL of the uploaded file will go here
                };

                // The rest of the code to add to Firestore
                categoriesCollection.add(categoryData).then(async (category) => {
                    await uploadPic(category.id);
                    console.log("category", category);
                    console.log('Post added successfully!');
                    // Create posts collection with a sample post to start
                    category.collection("posts").add(categoryData).then(firstPost => {
                        console.log("first post", firstPost)
                        firstPost.update({
                            "image" : localStorage.getItem("newCategoryImage")
                        })
                    })
                })

                // Give the user confirmation when a category is added
                var categoryConfirmation = document.getElementById("confirm-category");
                categoryConfirmation.style.display = "block";

            } else {
                console.error('User not signed in.');
                // Here you could, for example, display an error message or redirect to the login page.
            }
        });
    });
});
