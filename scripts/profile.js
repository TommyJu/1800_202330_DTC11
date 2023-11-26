function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            populateUserInfo(user)
            listenFileSelect(user);
        } else {
            console.log("No user is signed in");
        }
    });
}
doAll();

var currentUser;               //points to the document of the user who is logged in
function populateUserInfo(user) {
                // Check if user is signed in:
                if (user) {

                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                            //get the data fields of the user
                            var userName = userDoc.data().name;
                            var userCountry = userDoc.data().country;
                            // update with user's profile image
                            var userImage = userDoc.data().image;
                            document.getElementById("media").src = userImage
                        
                            //if the data fields are not empty, then write them in to the form.
                            if (userName != null) {
                                document.getElementById("nameInput").value = userName;
                            }
                            if (userCountry != null) {
                                document.getElementById("countryInput").value = userCountry;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
            
        }


onclick="editUserInfo()"    //event-listener that call the function editUserInfo after clicking on the button.

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    // get user entered values
    userName = document.getElementById('nameInput').value; //get the value of the field with id="nameInput"
    userCountry = document.getElementById('countryInput').value; //get the value of the field with id="countryInput"
    // update user's document in Firestore
    currentUser.update({
        name: userName,
        country: userCountry,
    })
    .then(() => {
        console.log("Document successfully updated!");
    })

    // disable edit
    document.getElementById('personalInfoFields').disabled = true;
}

// Profile picture element

var ImageFile;
// Change media preview on file upload
function listenFileSelect(user) {
    // listen for file selection
    var fileInput = document.getElementById("media-input"); // pointer #1
    const image = document.getElementById("media"); // pointer #2
    // When a change happens to the File Chooser Input
    fileInput.addEventListener('change', function (e) {
        ImageFile = e.target.files[0];   //Global variable
        var blob = URL.createObjectURL(ImageFile);
        image.src = blob; // Display this image
        uploadPic(user.uid)
    })
}


function uploadPic(userID) {
    console.log("inside uploadPic " + userID);

    var fileExtension = ImageFile.name.split('.').pop(); // returns file extension
    var storageRef = storage.ref("images/" + userID + "." + fileExtension); // store image with any file extension
    storageRef.put(ImageFile)   //global variable ImageFile
        .then(() => {
            console.log('2. Uploaded to Cloud Storage.');
            storageRef.getDownloadURL()

                // AFTER .getDownloadURL is done
                .then(function (url) { // Get URL of the uploaded file
                    console.log("3. Got the download URL.");

                    // Now that the image is on Storage, we can go back to the
                    // post document, and update it with an "image" field
                    // that contains the url of where the picture is stored.
                    db.collection("users").doc(userID).update({
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