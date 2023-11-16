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

            // document.getElementById("post-category").innerText = postID.data().category;
            document.getElementById("post-title-placeholder").innerText = postID.data().title;
            document.getElementById("post-image-placeholder").src = postID.data().image;
            document.getElementById("post-description-placeholder").innerText = postID.data().description;
            document.getElementById("posted-date-placeholder").innerText = postID.data().date
            
        })
}

dynamicallyPopulatePost();
