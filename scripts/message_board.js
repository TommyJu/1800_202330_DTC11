// --------- Scroll to top button ---------
const scrollToTop = document.getElementById("scroll-to-top");
const cardContainer = document.getElementById("card-container");
scrollToTop.addEventListener("click", () => {
    cardContainer.scrollTop = 0;
})

// global variables
var currentCategory = localStorage.getItem("currentCategory");
var currentCategoryTitle = localStorage.getItem("currentCategoryTitle");


// ---------- Add cards using the Firestore database ----------
function displayCardsDynamically(category) {
    let postsCollection = db.collection("categories").doc(category).collection("posts");
    console.log("collection", postsCollection);
    postsCollection.orderBy("date").get() 
        .then(posts => {
            // Create each message board post
            posts.forEach(doc => { //iterate thru each doc
                console.log(doc)
                var title = doc.data().title;
                var description = doc.data().description;
                var image = doc.data().image;
                var userID = doc.data().userId;
                var userName = doc.data().userName;
                var docID = doc.id;
                var date = doc.data().date;

                let cardTemplate = document.getElementById("card-template");
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                // update title, description and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-description-container > p').innerHTML = description;
                newcard.querySelector('.card-image').src = image;
                newcard.querySelector('.card-date').innerHTML = date;
                newcard.querySelector('.card-user').innerHTML = userName;
                newcard.querySelector('.card-image').src = image;
                newcard.querySelector('.card-link').href = `view_message.html?postID=${docID}`;

                createComments(newcard, docID);
                


                //attach to card-container
                // document.getElementById("card-container").prepend(newcard);
                document.getElementById("card-container").insertBefore(
                    newcard,
                    document.getElementById("scroll-to-top-container"));
            })
        })
}


function createComments(newcard, docID) {
    let commentsListDiv = newcard.querySelector('.comments-list');
    let submitCommentButton = newcard.querySelector('.submit-comment');
    let commentInput = newcard.querySelector('.add-comment input');
    let commentButton = newcard.querySelector('.comment-button');
    let commentsSection = newcard.querySelector('.comments-section');

    // Asegura que la sección de comentarios pueda desplegarse incluso si no hay comentarios
    commentButton.addEventListener('click', () => {
        commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
    });

    submitCommentButton.addEventListener('click', () => {
        let commentText = commentInput.value;
        addCommentToFirestore(commentText, docID, commentsListDiv);
        commentInput.value = ''; // Clear the input after submit
    });

    db.collection('comments').where('postId', '==', docID).orderBy('timestamp', 'desc').get()
        .then(commentsSnapshot => {
            let commentCount = commentsSnapshot.docs.length;
            commentButton.innerText = commentCount > 0 ? `Comments (${commentCount})` : 'No comments';
            
            commentsSnapshot.forEach(commentDoc => {
                const commentData = commentDoc.data();
                const commentDate = commentData.timestamp.toDate();
                const formattedTimeAgo = timeAgo(commentDate);

                let commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `
                    <p><strong>${commentData.userName}</strong></p>
                    <p>${commentData.text}</p>
                    <span>${formattedTimeAgo}</span>
                `;
                commentsListDiv.appendChild(commentDiv);
            });
        })
        .catch(error => {
            console.error('Error to get comments: ', error);
            commentButton.innerText = 'No comments';
        });
}



// function getParameterByName(name, url = window.location.href) {
//     name = name.replace(/[\[\]]/g, '\\$&');
//     var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, ' '));
// }

// var category = getParameterByName('category');


document.addEventListener('DOMContentLoaded', function () {
    // var urlParams = new URLSearchParams(window.location.search);
    // var category = urlParams.get('category');
    // var addPostLink = document.getElementById('add-post-link');

    // if (category && addPostLink) {
    //     addPostLink.href = `new_post_screen.html?category=${category}`;
    // }
    // Display cards based on the category obtained from the URL

    displayCardsDynamically(currentCategory); // global variable
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


function displayCategory(category) {
    messageBoardCategory.innerText = category;
    console.log(category);
}
displayCategory(currentCategoryTitle) // 


function getUserName(userId) {
    return db.collection('users').doc(userId).get().then(userDoc => {
        if (userDoc.exists) {
            return userDoc.data().name; 
        } else {
            throw new Error('User not found');
        }
    });
}


function addCommentToFirestore(commentText, postId, commentsListDiv) {
    const userId = localStorage.getItem('userID');
    getUserName(userId).then(userName => {
        if (!userName) {
            throw new Error('Nombre de usuario no encontrado');
        }

        return db.collection('comments').add({
            text: commentText,
            postId: postId,
            userId: userId,
            userName: userName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
    })
        .then((docRef) => {
            return docRef.get();
        })
        .then((commentSnapshot) => {
            if (commentSnapshot.exists) {
                const commentData = commentSnapshot.data();
                const commentDate = commentData.timestamp.toDate();
                const formattedTimeAgo = timeAgo(commentDate);

        
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `
                <p><strong>${commentData.userName}</strong> </p>
                <p>${commentText}</p>
                <span>${formattedTimeAgo}</span>
            `;

                commentsListDiv.appendChild(commentDiv);
            } else {
                throw new Error('El comentario no existe.');
            }
        })
        .catch(error => {
            console.error('Error al añadir comentario o al recuperar información: ', error);
        });
}





function timeAgo(dateParam) {
    if (!dateParam) {
        return null;
    }

    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const months = Math.round(weeks / 4.35);  
    const years = Math.round(months / 12);

    if (seconds < 60) {
        return `${seconds} sec`;
    } else if (minutes < 60) {
        return `${minutes} min`;
    } else if (hours < 24) {
        return `${hours} h`;
    } else if (days < 7) {
        return `${days} d`;
    } else if (weeks < 4.35) {  
        return `${weeks} w`;
    } else if (months < 12) {
        return `${months} m`;
    } else {
        return `${years} y`;
    }
}
