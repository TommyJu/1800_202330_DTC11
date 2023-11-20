//----------------------------------------------------------
// This function is the only function that's called.
// This strategy gives us better control of the page.
//----------------------------------------------------------
function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            insertNameFromFirestore(user);
            getBookmarks(user)
        } else {
            console.log("No user is signed in");
        }
    });
}
doAll();

// insert the user's name into the page
function insertNameFromFirestore(user) {
            db.collection("users").doc(user.uid).get().then(userDoc => {
                userName = userDoc.data().name;
                console.log(userName)
                document.getElementById("name-goes-here").innerHTML = userName;
            })
}

//----------------------------------------------------------
// This function takes input param User's Firestore document pointer
// and retrieves the "saved" array (of bookmarks) 
// and dynamically displays them in the gallery
//----------------------------------------------------------
function getBookmarks(user) {
    db.collection("users").doc(user.uid).get()
        .then(userDoc => {

			// Get the map of bookmarks
            var bookmarks = userDoc.data().bookmarks;
            console.log(bookmarks);

			// Get pointer the new card template
            let newcardTemplate = document.getElementById("savedCardTemplate");

            // Get pointer to the container where cards will be displayed
			let cardContainer = document.getElementById("postCardGroup");

            // Iterate through the map of bookmarked posts
            for (let postID in bookmarks){
                if(bookmarks.hasOwnProperty(postID)){
                    let currentCategory = bookmarks[postID].category;
                    console.log("current category is ", currentCategory);

                    // fetch the details of the bookmarked post
                    db.collection("categories").doc(currentCategory).collection("posts").doc(postID)
                    .get().then(doc =>{
                        if(doc.exists){
                            // create a new card for the bookmarked post
                            let newcard = newcardTemplate.content.cloneNode(true);
                            newcard.querySelector('.card-title').innerHTML = doc.data().title;
                            newcard.querySelector('.card-description').innerHTML = doc.data().description;
                            newcard.querySelector('.card-image').src = doc.data().image;
                            newcard.querySelector('a').href = "view_message.html?postID=" + postID;

                            // append the new card to the container
                            cardContainer.appendChild(newcard);
                        }else{
                            console.log("You haven't bookmarked any posts yet.Check out the posts and bookmark them!")
                        }
                    }).catch(error => {
                        console.log("Error getting document:", error);
                    })
                }
            }
        })
}