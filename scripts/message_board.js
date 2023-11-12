// --------- Scroll to top button ---------
const scrollToTop = document.getElementById("scroll-to-top");
const cardContainer = document.getElementById("card-container");
scrollToTop.addEventListener("click", () => {
    cardContainer.scrollTop = 0;
})


// ---------- Add cards using the Firestore database ----------
selectedCategory = null
function displayCardsDynamically(collection, selectedCategory) {
    let cardTemplate = document.getElementById("card-template");
    let query = db.collection(collection);

    // Filter by category using selectedCategory
    if (selectedCategory) { 
        query = query.where('category', '==', selectedCategory);
    }

    query.get()
        .then(allPosts => {
            // Create each message board post
            allPosts.forEach(doc => { //iterate thru each doc
                var title = doc.data().title;    
                var description = doc.data().description; 
				var category = doc.data().category;
                var image = doc.data().image;
                
                var docID = doc.id;          
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                //update title, description and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-description > p').innerHTML = description;
                newcard.querySelector('.card-category').innerHTML = category;
                newcard.querySelector('.card-image').src = image;
                
                
                // -------- Image can be toggled with --------
                // newcard.querySelector('.image-container').style.display = "none";
                // newcard.querySelector('.image-container').style.display = "block";


                // -------- Can use this code to add a card image when a new card is created -------
                // newcard.querySelector('.card-image').src = "";
                // newcard.querySelector('.image-container').style.display = "block";


                //attach to card-container
                // document.getElementById("card-container").prepend(newcard);
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


// ---------- Add user name and category to message board title ---------
const messageBoardCategory = document.getElementById("message-board-category")
const messageBoardUserName = document.getElementById("message-board-user-name");

// Display the user's name using localStorage
function displayUserName() {
    var userID = localStorage.getItem("userID");
    console.log(userID);
    currentUser = db.collection("users").doc(userID); // Go to the Firestore document of the user
    currentUser.get().then(userDoc => {
        // Get the user name
        var userName = userDoc.data().name;
        console.log(userName);
        // Add user name to html
        messageBoardUserName.innerText = userName;
    }) 
}
displayUserName();

function displayCategory() {
    messageBoardCategory.innerText = category;
    console.log(category);
}
displayCategory()
