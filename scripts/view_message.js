// global variables
var currentCategory = localStorage.getItem("currentCategory");

function dynamicallyPopulatePost(){
    var postsCollection = db.collection("categories").doc(currentCategory).collection("posts");
    let url = new URL(window.location.href);
    let docID = url.searchParams.get("postID");
    console.log(docID);

    postsCollection.doc(docID)
        .onSnapshot(postID => {
            // console.log(postID.data().category);
            console.log(postID.data().title)
            console.log(postID.data().image)
            console.log(postID.data().description);
            console.log(postID.data().date);
            console.log(docID)

            // document.getElementById("post-category").innerText = postID.data().category;
            document.getElementById("post-title-placeholder").innerText = postID.data().title;
            document.getElementById("post-image-placeholder").src = postID.data().image;
            document.getElementById("post-description-placeholder").innerText = postID.data().description;
            document.getElementById("posted-date-placeholder").innerText = postID.data().date
            document.querySelector("i").id = 'save-' + docID;
            document.querySelector("i").onclick = () => updateBookmark(docID);
        })
}

dynamicallyPopulatePost();

// function updateBookmark(docID){
//     // make bookmark icon clickable
//     let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
//         currentUser.get().then(userDoc => {
//         let bookmark = userDoc.data().bookmarks;
//         let iconID = 'save-' + docID;
//         let isBookmarked = bookmark.includes(docID); // check if the post is already bookmarked
//         console.log(isBookmarked);

//         if(isBookmarked){
//             // remove bookmark
//             currentUser.update({
//                 bookmarks: firebase.firestore.FieldValue.arrayRemove(docID)
//             }).then(() => {
//                 console.log("Bookmark removed");
//                 document.getElementById(iconID).style.color = "black";
//             })
//         } else{
//             // add bookmark
//             currentUser.update({
//                 bookmarks: firebase.firestore.FieldValue.arrayUnion(docID)
//             }).then(() => {
//                 console.log("Bookmark added");
//                 document.getElementById(iconID).style.color = "red";
//             })
//         }
//     })
// }

function updateBookmark(docID){
    let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
    currentUser.get().then(userDoc => {
        let bookmark = userDoc.data().bookmarks;
        // Check if bookmark is undefined and initialize it as an empty array if it is
        if (typeof bookmark === "undefined") {
            bookmark = [];
        }

        let iconID = 'save-' + docID;
        let iconElement = document.getElementById(iconID);
        let isBookmarked = bookmark.includes(docID); 

        if(isBookmarked){
            // remove bookmark
            currentUser.update({
                bookmarks: firebase.firestore.FieldValue.arrayRemove(docID)
            }).then(() => {
                console.log("Bookmark removed");
                iconElement.classList.remove("fa-solid", "fa-bookmark", "fa-xl");
                iconElement.classList.add("fa-regular", "fa-bookmark", "fa-xl");
            })
        } else{
            // add bookmark
            currentUser.update({
                bookmarks: firebase.firestore.FieldValue.arrayUnion(docID)
            }).then(() => {
                console.log("Bookmark added");
                iconElement.classList.remove("fa-regular", "fa-bookmark", "fa-xl");
                iconElement.classList.add("fa-solid","fa-bookmark","fa-xl");

            })
        }
    })
}

