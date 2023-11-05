// scroll to top
const scrollToTop = document.getElementById("scroll-to-top");
const cardContainer = document.getElementById("card-container");

scrollToTop.addEventListener("click", () => {
    cardContainer.scrollTop = 0;
})

function displayCardsDynamically(collection, selectedCategory = null) {
    let cardTemplate = document.getElementById("card-template");
    let query = db.collection(collection);
    if (selectedCategory) { // A filter was added in order to
        query = query.where('category', '==', selectedCategory);
    }

    query.get()
        .then(allPosts => {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allPosts.forEach(doc => { //iterate thru each doc
                var title = doc.data().title;    
                var description = doc.data().description; 
				var category = doc.data().category;
                
                var docID = doc.id;          
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                //update title, description and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-description > p').innerHTML = description;
                newcard.querySelector('.card-category').innerHTML = category;
                newcard.querySelector('.card-image').src = `./images/postImages/${docID}.jpg`; //Example: NV01.jpg


                //attach to card-container
                // document.getElementById("card-container").insertBefore(newcard);
                document.getElementById("card-container").insertBefore(
                    newcard, 
                    document.getElementById("scroll-to-top"));

                //i++;   //Optional: iterate variable to serve as unique ID
            })
        })
}







function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var category = getParameterByName('category'); 


document.addEventListener('DOMContentLoaded', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get('category');
    var addPostLink = document.getElementById('add-post-link');

    if (category && addPostLink) {
        addPostLink.href = `new_post_screen.html?category=${category}`;
    }
    // Display cards based on the category obtained from the URL
    displayCardsDynamically("allPosts", category);
});