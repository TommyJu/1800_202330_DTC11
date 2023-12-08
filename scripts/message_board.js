const cardContainer = document.getElementById("card-container");

// global variables
var currentCategory = localStorage.getItem("currentCategory");
var currentCategoryTitle = localStorage.getItem("currentCategoryTitle");


// ---------- Add cards using the Firestore database ----------
function displayCardsDynamically(category) {
    let postsCollection = db.collection("categories").doc(category).collection("posts");

    postsCollection.orderBy("date").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            var doc = change.doc;
            var title = doc.data().title;
            var description = doc.data().description;
            var image = doc.data().image;
            var userName = doc.data().userName;
            var docID = doc.id;
            var date = doc.data().date;
            var userId = doc.data().userId;

            let cardTemplate = document.getElementById("card-template");

            if (change.type === "added") {
                let newcard = cardTemplate.content.cloneNode(true);

                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-description-container > p').innerHTML = description;
                if (image) { // If there is an image, add it to the card
                    newcard.querySelector('.card-image').src = image;
                }
                newcard.querySelector('.card-date').innerHTML = date;
                newcard.querySelector('.card-user').innerHTML = userName;
                newcard.querySelector('.card-link').href = `view_message.html?postID=${docID}`;
                newcard.querySelector('.card').setAttribute('data-doc-id', docID); // Añade un atributo para identificar la tarjeta
                newcard.querySelector("i").id = 'save-' + docID;
                newcard.querySelector("i").onclick = () => updateBookmark(docID);

                // Find the card user image element within the cloned content
                const cardUserImage = newcard.querySelector(".card-user-image");

                db.collection("users").doc(userId).get().then(userDoc => {
                    let profileImage = ""; // Default image URL

                    if (userDoc.exists) {
                        let userProfile = userDoc.data();
                        profileImage = userProfile.image; // Get the profile image
                        console.log("Profile image URL:", profileImage); // Verifica la URL de la imagen de perfil
                    } else {
                        console.log("User document not found or does not contain an image.");
                    }

                    // Check if the element exists before setting the image source
                    if (cardUserImage) {
                        cardUserImage.src = profileImage || 'https://firebasestorage.googleapis.com/v0/b/comp1800-dtc11.appspot.com/o/images%2Fundefined.png?alt=media&token=705196ac-2166-4dec-bed4-d906ca77017d';
                    } else {
                        console.error("Card user image element not found.");
                    }
                }).catch(error => {
                    console.error("Error retrieving user image:", error);
                });

                // Keep bookmark active 
                let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
                currentUser.get().then(userDoc => {
                    let bookmark = userDoc.data().bookmarks;
                    let iconID = 'save-' + docID;
                    let isBookmarked = bookmark.hasOwnProperty(docID); // check if the post is already bookmarked
                    console.log("isBookmarked", isBookmarked);
                    if (isBookmarked) {
                        document.getElementById(iconID).classList.remove("fa-regular", "fa-bookmark", "fa-2xl");
                        document.getElementById(iconID).classList.add("fa-solid", "fa-bookmark", "fa-2xl");
                    }
                })
                // create comments for post
                createComments(newcard, docID);

                document.getElementById("card-container").append(newcard);
            } else if (change.type === "modified") {
                const existingCard = document.querySelector(`.card[data-doc-id="${docID}"]`);
                if (existingCard) {
                    if (image) {
                        existingCard.querySelector('.card-image').src = image;
                    }
                }
            }
        });
    });
}


// Bookmark a post from the message board
function updateBookmark(docID) {

    var currentCategory = localStorage.getItem("currentCategory");

    let currentUser = db.collection("users").doc(localStorage.getItem("userID"));
    currentUser.get().then(userDoc => {
        let bookmarks = userDoc.data().bookmarks || {};

        let iconID = 'save-' + docID;
        let iconElement = document.getElementById(iconID);

        if (bookmarks[docID]) {
            let updateObject = {};
            updateObject['bookmarks.' + docID] = firebase.firestore.FieldValue.delete();
            currentUser.update(updateObject).then(() => {
                console.log("Bookmark removed");
                iconElement.classList.remove("fa-solid", "fa-bookmark", "fa-2xl");
                iconElement.classList.add("fa-regular", "fa-bookmark", "fa-2xl");
            });
        } else {
            let updateObject = {};
            updateObject['bookmarks.' + docID] = {
                category: currentCategory,
            };
            currentUser.update(updateObject).then(() => {
                console.log("Bookmark added");
                iconElement.classList.remove("fa-regular", "fa-bookmark", "fa-2xl");
                iconElement.classList.add("fa-solid", "fa-bookmark", "fa-2xl");
            });
        }
    });
}


function createComments(newcard, docID) {
    let commentsListDiv = newcard.querySelector('.comments-list');
    let submitCommentButton = newcard.querySelector('.submit-comment');
    let commentInput = newcard.querySelector('.add-comment input');
    let commentButton = newcard.querySelector('.comment-button');
    let commentsSection = newcard.querySelector('.comments-section');

    // Ensure the comments section can be toggled even if there are no comments
    commentButton.addEventListener('click', () => {
        commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
    });

    submitCommentButton.addEventListener('click', () => {
        event.preventDefault(); // Previene el envío por defecto del formulario
        commentsSection.style.display = 'block'; // Ensures the comments section is shown

        let commentText = commentInput.value;
        addCommentToFirestore(commentText, docID, commentsListDiv);
        commentInput.value = ''; // Clear the input after submit


        // Waits for the comment to be added to the DOM before scrolling to the bottom
        setTimeout(() => {
            let comments = commentsListDiv.querySelectorAll('.comment');
            if (comments.length > 0) {
                let lastComment = comments[comments.length - 1];
                lastComment.scrollIntoView({ behavior: 'smooth', block: 'end' });

                // Opcional: Prevenir que cualquier otro elemento reciba enfoque
                lastComment.focus({ preventScroll: true });
            }
        }, 500); // It waits 500ms for the comment to be added to the DOM
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


document.addEventListener('DOMContentLoaded', function () {
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

                // Actualizar el contador de comentarios
                updateCommentCount(postId);
            } else {
                throw new Error('El comentario no existe.');
            }
        })
        .catch(error => {
            console.error('Error al añadir comentario o al recuperar información: ', error);
        });
}

function updateCommentCount(postId) {
    const postCard = document.querySelector(`.card[data-doc-id="${postId}"]`);
    if (postCard) {
        const commentButton = postCard.querySelector('.comment-button');
        db.collection('comments').where('postId', '==', postId).get()
            .then(commentsSnapshot => {
                let commentCount = commentsSnapshot.docs.length;
                commentButton.innerText = commentCount > 0 ? `Comments (${commentCount})` : 'No comments';
            })
            .catch(error => {
                console.error('Error al obtener comentarios: ', error);
            });
    }
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


// possibly unused variables
var submitButton = document.querySelector('.submit-button');
// Obtén el modal
var modal = document.getElementById("exampleModal");
// Obtén el botón que abre el modal
var btn = document.getElementById("add-post-link");
// Obtén el elemento <span> que cierra el modal
var span = document.getElementsByClassName("close")[0];
