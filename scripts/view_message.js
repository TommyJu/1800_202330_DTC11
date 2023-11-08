function displayPostInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "docID" ); //get value for key "id"
    console.log( ID );

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection( "allPosts" )
        .doc( ID )
        .get()
        .then( doc => {
            thisPost = doc.data();
            // postImg = thisPost.###; // replace ### with the name of the field for the image
            postTitle = doc.data().title;
            
            // only populate title, and image
            document.getElementById( "post-title-placeholder" ).innerHTML = postTitle;
            // let imgEvent = document.querySelector( "post-image-placeholder" );
            // imgEvent.src = "../images/" + postImg + ".jpg";
        } );
}
displayPostInfo();