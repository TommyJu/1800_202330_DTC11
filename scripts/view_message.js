// global variables
var currentCategory = localStorage.getItem("currentCategory");
var ImageFile;

function dynamicallyPopulatePost(){
    var postsCollection = db.collection("categories").doc(currentCategory).collection("posts");
    let url = new URL(window.location.href);
    let docID = url.searchParams.get("postID");
    let currentCategoryID = localStorage.getItem("currentCategory");
    

    postsCollection.doc(docID)
        .onSnapshot(postID => {
            // console.log(postID.data().category);
            console.log(postID.data().title)
            console.log(postID.data().image)
            console.log(postID.data().description);
            console.log(postID.data().date);
            console.log(docID, "= uniqueID for each post");
            console.log(currentCategoryID, "= currentCategoryID");

            // document.getElementById("post-category").innerText = postID.data().category;
            document.getElementById("post-title-placeholder").innerText = postID.data().title;
            document.getElementById("post-image-placeholder").src = postID.data().image;
            document.getElementById("post-description-placeholder").innerText = postID.data().description;
            document.getElementById("posted-date-placeholder").innerText = postID.data().date
            document.querySelector("i").id = 'save-' + docID;
            document.querySelector("i").onclick = () => updateBookmark(docID);
            document.querySelector("#delete-post").onclick = () => deletePost(docID);

            // keep bookmarked if it's clicked already
            let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
            currentUser.get().then(userDoc => {
                let bookmark = userDoc.data().bookmarks;
                let iconID = 'save-' + docID;
                let isBookmarked = bookmark.hasOwnProperty(docID); // check if the post is already bookmarked
                console.log("isBookmarked", isBookmarked);
                if(isBookmarked){
                    document.getElementById(iconID).classList.remove("fa-regular", "fa-bookmark", "fa-2xl");
                    document.getElementById(iconID).classList.add("fa-solid","fa-bookmark","fa-2xl");
                }
            })
        })
}

dynamicallyPopulatePost();


function updateBookmark(docID){

    var currentCategory = localStorage.getItem("currentCategory");

    let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
    currentUser.get().then(userDoc => {
        let bookmarks = userDoc.data().bookmarks || {};

        let iconID = 'save-' + docID;
        let iconElement = document.getElementById(iconID);

        if(bookmarks[docID]){
            let updateObject = {};
            updateObject['bookmarks.' + docID] = firebase.firestore.FieldValue.delete();
            currentUser.update(updateObject).then(() => {
                console.log("Bookmark removed");
                iconElement.classList.remove("fa-solid", "fa-bookmark", "fa-2xl");
                iconElement.classList.add("fa-regular", "fa-bookmark", "fa-2xl");
            });
        } else{
            let updateObject = {};
            updateObject['bookmarks.' + docID] = {
                category: currentCategory,
            };
            currentUser.update(updateObject).then(() => {
                console.log("Bookmark added");
                iconElement.classList.remove("fa-regular", "fa-bookmark", "fa-2xl");
                iconElement.classList.add("fa-solid","fa-bookmark","fa-2xl");
            });
        }
    });
}

// delete post function
function deletePost(docID){
    console.log("delete post btn clicked");
    var result = confirm("Are you sure you want to delete this post?");
    if (result){
        db.collection("categories").doc(currentCategory).collection("posts").doc(docID).delete().then(() => {
            console.log("Post successfully deleted!");
            deleteFromMyPosts(docID);
            window.location.href = "message_board.html";
        }).catch((error) => {
            console.error("Error removing post: ", error);
        });
    }
}

// delete post from my posts in user collection
function deleteFromMyPosts(docID){
    firebase.auth().onAuthStateChanged(user => {
        // remove document ID from user document
        db.collection("users").doc(user.uid).update({
            myposts: firebase.firestore.FieldValue.arrayRemove(docID)
        }).then(() => {
            console.log("delete post from my post in users collection");
            deleteFromStorage(docID);
            deleteFromCategories(docID);
            // window.location.href = "message_board.html";
        }).catch((error) => {
            console.error("Error removing post: ", error);
        });
    })
}

function getExtensionFromImageUrl(url){
    return url.split('.').pop();
}

function deleteFromCategories(docID) {
    var postsCollection = db.collection("categories").doc(currentCategory).collection("posts");
    postsCollection.doc(docID).delete().then(() => {
        console.log("Post deleted from categories collection")
    }).catch(error => {
        console.log("Error deleting post from categories collection")
    })
}

function deleteFromStorage(imageUrl){
    var storageRef = firebase.storage().ref();
    var extension = getExtensionFromImageUrl(imageUrl)
    var imagePath = 'images/' + imageUrl + '.' + extension;
    var imageRef = storageRef.child(imagePath);

    // delete the file
    imageRef.delete().then(() => {
        // File deleted successfully
        console.log("delete image from storage");
        alert("DELETE SUCCESSFUL");
        location.reload();
    }).catch((error) => {
        // Uh-oh, an error occurred!
        console.log("error deleting image from storage", error);
    });
}

