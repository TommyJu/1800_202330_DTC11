// Global variables
var ImageFile;
var currentCategory = localStorage.getItem("currentCategory");

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


//------------------------------------------------
// So, a new post document has just been added
// and it contains a bunch of fields.
// We want to store the image associated with this post,
// such that the image name is the postid (guaranteed unique).
// 
// This function is called AFTER the post has been created, 
// and we know the post's document id.
//------------------------------------------------
function uploadPic(postDocID) {
    console.log("inside uploadPic " + postDocID);

    var postsCollection = db.collection("categories").doc(currentCategory).collection("posts");
    var fileExtension = ImageFile.name.split('.').pop(); // returns file extension
    var storageRef = storage.ref("images/" + postDocID + "." + fileExtension); // store image with any file extension

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
                    postsCollection.doc(postDocID).update({
                        "image": url // Save the URL into users collection
                    })
                        // AFTER .update is done
                        .then(function () {
                            console.log('4. Added pic URL to Firestore.');
                            // One last thing to do:
                            // save this postID into an array for the OWNER
                            // so we can show "my posts" in the future
                            savePostIDforUser(postDocID);
                        })
                })
        })
        .catch((error) => {
            console.log("error uploading to cloud storage");
        })
}


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


//--------------------------------------------
//saves the post ID for the user, in an array
//--------------------------------------------
function savePostIDforUser(postDocID) {
    firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("postdoc id is: " + postDocID);
        db.collection("users").doc(user.uid).update({
            myposts: firebase.firestore.FieldValue.arrayUnion(postDocID)
        })
            .then(() =>{
                console.log("5. Saved to user's document!");
                //window.location.href = "showposts.html";
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    })
}


// Add post to database on submit
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('myform');
    var messageSentDiv = document.getElementById('message-sent'); // Gets the "SENT!" message div
    // var urlParams = new URLSearchParams(window.location.search);
    // var category = urlParams.get('category');


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // This authentication state listener should be registered once, not on every form submit.
        // If needed, place this listener outside and use a variable to store the user state.
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // current Category is a local variable
                let postsCollection = db.collection("categories").doc(currentCategory).collection("posts");
                var userId = user.uid;
                var title = document.getElementById('title').value;
                var description = document.getElementById('description').value;

                var postData = {
                    date: new Date().toLocaleDateString(),
                    title: title,
                    description: description,
                    // category: category,
                    userId: userId,
                    userName: userName, // global variable
                    last_updated: firebase.firestore.FieldValue
                       .serverTimestamp() //current system time
                    // The URL of the uploaded file will go here
                };

                // The rest of the code to add to Firestore
                // db.collection('allPosts').add(postData).then(doc => {
                postsCollection.add(postData).then(doc => {
                    uploadPic(doc.id);
                    console.log('Post added successfully!');
                    form.style.display = 'none';
                    messageSentDiv.style.display = 'flex';

                    // Redirect the user to the message board page with the correct category
                    // setTimeout(function () {
                    //     window.location.href = `message_board.html`;
                    // }, 1000); // Redirects after 3 seconds
                }).catch(function (error) {
                    console.error('Error adding post: ', error);
                });
            } else {
                console.error('User not signed in.');
                // Here you could, for example, display an error message or redirect to the login page.
            }
        });
    });
});
