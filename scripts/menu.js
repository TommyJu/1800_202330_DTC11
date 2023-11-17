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
};


function storeCategoryTitle(value) {
    let key = "currentCategoryTitle";
    localStorage.setItem(key, value);
};


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
                    categoryImageUrl = url // store result in global variable

                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    categoriesCollection.doc(categoryDocID).update({
                        "image": url // Save the URL into users collection
                    })
                        // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                            // One last thing to do:
                            // save this postID into an array for the OWNER
                            // so we can show "my posts" in the future
                            saveCategoryIDforUser(categoryDocID);
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
        categoryImageUrl = blob;
    })
}
listenFileSelect();

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('myform');
    // var messageSentDiv = document.getElementById('message-sent'); // Gets the "SENT!" message div
    // var urlParams = new URLSearchParams(window.location.search);
    // var category = urlParams.get('category');


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
                categoriesCollection.add(categoryData).then(category => {
                    uploadPic(category.id);
                    console.log("category", category);
                    
                    console.log('Post added successfully!');
                    // Create posts collection with a sample post to start
                    category.collection("posts").add(categoryData).then(firstPost => {
                        console.log("first post", firstPost)
                        firstPost.update({
                            "image" : categoryImageUrl
                        })
                    })
                })

                
                // form.style.display = 'none';
                // messageSentDiv.style.display = 'flex';

                // Redirect the user to the message board page with the correct category
                // setTimeout(function () {
                //     window.location.href = `message_board.html`;
               // }, 1000); // Redirects after 3 seconds

                // }).catch(function (error) {
                //     console.error('Error adding post: ', error);
                // });
            } else {
                console.error('User not signed in.');
                // Here you could, for example, display an error message or redirect to the login page.
            }
        });
    });
});