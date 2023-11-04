// scroll to top
const scrollToTop = document.getElementById("scroll-to-top");
const cardContainer = document.getElementById("card-container");

scrollToTop.addEventListener("click", () => {
    cardContainer.scrollTop = 0;
})

function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("card-template"); // Retrieve the HTML element with the ID "card-template" and store it in the cardTemplate variable. 

    db.collection(collection).get()   //the collection called "allPosts"
        .then(allPosts => {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allPosts.forEach(doc => { //iterate thru each doc
                var title = doc.data().title;    
                var description = doc.data().description; 
								
                
                var docID = doc.id;          
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                //update title, description and image
                newcard.querySelector('h2').innerHTML = title;
                newcard.querySelector('.card-description > p').innerHTML = description;
                
                // newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg


                //attach to card-container
                // document.getElementById("card-container").insertBefore(newcard);
                document.getElementById("card-container").insertBefore(
                    newcard, 
                    document.getElementById("scroll-to-top"));

                //i++;   //Optional: iterate variable to serve as unique ID
            })
        })
}

displayCardsDynamically("allPosts");  //input param is the name of the collection