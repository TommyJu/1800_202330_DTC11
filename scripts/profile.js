function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            populateUserInfo(user)
            getBookmarks(user);
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

// Store category so user can navigate back to desired message board
function storeCategory(value) {
    let key = "currentCategory";
    localStorage.setItem(key, value);
};

// Populate my profile page with bookmarked posts
const myBookmarks = document.getElementById("my-bookmarks")
function getBookmarks(user) {
    db.collection("users").doc(user.uid).get()
        .then(userDoc => {

            // Get the Object of bookmarks
            var bookmarks = userDoc.data().bookmarks;
            console.log(bookmarks);
						
			// Get pointer the new card template
            let newcardTemplate = document.getElementById("bookmarkCardTemplate");

			// Iterate through the bookmarked posts object
            Object.keys(bookmarks).forEach(postKey => {
                console.log(postKey);
                var postCategory = bookmarks[postKey].category;
                console.log(postCategory)
                db.collection("categories").doc(postCategory).collection("posts").doc(postKey).get().then(doc => {
                    var title = doc.data().title; // get value of the "name" key
                    var docID = doc.id;  //this is the autogenerated ID of the document
                    var image = doc.data().image;
                    
                    //clone the new card
                    let newcard = newcardTemplate.content.cloneNode(true);

                    //update title and some pertinant information
                    newcard.querySelector('.card-title').innerHTML = title;
                    newcard.querySelector('.card-image').src = image; //Example: NV01.jpg
                    // Allow user to navigate to bookmarked post
                    newcard.querySelector('a').href = "view_message.html?postID=" + docID;
                    newcard.querySelector('a').addEventListener("click", () => {
                        storeCategory(postCategory);
                    });
                    myBookmarks.appendChild(newcard);
                })
            });
        })
}

// populate my profile page with my posts
// function getCategories(user) {
//     db.collection("users").doc(user.uid).get()
//         .then(userDoc => {
//             // Get the Object of bookmarks
//             var myPosts = userDoc.data().myposts;
//             console.log(bookmarks);
						
// 			// Get pointer the new card template
//             let newcardTemplate = document.getElementById("postCardTemplate");

// 			// Iterate through the bookmarked posts object
//             Object.keys(bookmarks).forEach(postKey => {
//                 console.log(postKey);
//                 var postCategory = bookmarks[postKey].category;
//                 console.log(postCategory)
//                 db.collection("categories").doc(postCategory).collection("posts").doc(postKey).get().then(doc => {
//                     var title = doc.data().title; // get value of the "name" key
//                     var docID = doc.id;  //this is the autogenerated ID of the document
//                     var image = doc.data().image;
                    
//                     //clone the new card
//                     let newcard = newcardTemplate.content.cloneNode(true);

//                     //update title and some pertinant information
//                     newcard.querySelector('.card-title').innerHTML = title;
//                     newcard.querySelector('.card-image').src = image; //Example: NV01.jpg
//                     // Allow user to navigate to bookmarked post
//                     newcard.querySelector('a').href = "view_message.html?postID=" + docID;
//                     newcard.querySelector('a').addEventListener("click", () => {
//                         storeCategory(postCategory);
//                     });
//                     yourBookmarks.appendChild(newcard);
//                 })
//             });
//         })
// }