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
                var userID = doc.data().userId;
                var userName = doc.data().userName;
                console.log(userID);
                var docID = doc.id;

                // Retrieve the timestamp seconds and convert to milliseconds
                // var date = new Date(doc.data().last_updated.seconds*1000).toDateString();
                var date = doc.data().date;
                console.log(doc.data().last_updated);
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                // update title, description and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-description-container > p').innerHTML = description;
                newcard.querySelector('.card-image').src = image;
                newcard.querySelector('.card-date').innerHTML = date;
                newcard.querySelector('.card-user').innerHTML = userName;
                newcard.querySelector('.card-image').src = image;
                newcard.querySelector('.card-link').href = `view_message.html?postID=${docID}`;

                // Añadir manejador de eventos para enviar nuevos comentarios
                let commentsListDiv = newcard.querySelector('.comments-list');



                let submitCommentButton = newcard.querySelector('.submit-comment');
                let commentInput = newcard.querySelector('.add-comment input');
                submitCommentButton.addEventListener('click', () => {
                    let commentText = commentInput.value;
                    addCommentToFirestore(commentText, docID, commentsListDiv); // Función para añadir comentario
                    commentInput.value = ''; // Limpiar el campo después de enviar
                })


                // Referencia al contenedor donde se insertarán los comentarios


                // Obtener los comentarios del post específico
                db.collection('comments').where('postId', '==', doc.id).orderBy('timestamp', 'desc').get()
                    .then(commentsSnapshot => {
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
                        console.error('Error al obtener comentarios: ', error);
                    });


                //attach to card-container
                // document.getElementById("card-container").prepend(newcard);
                document.getElementById("card-container").insertBefore(
                    newcard,
                    document.getElementById("scroll-to-top"));

                // Get all buttons with the class "comment-button" and the corresponding comment divs
                const commentButtons = document.querySelectorAll('.comment-button');
                const commentsSections = document.querySelectorAll('.comments-section');

                // Add an event handler to each button
                commentButtons.forEach((button, index) => {
                    button.addEventListener('click', () => {
                        // Change the style of the corresponding comment div to "block" to show it
                        commentsSections[index].style.display = 'block';
                    });
                });
            })
        })
}

// ------ Get user name from the users collection then add to cards -------


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


function getUserName(userId) {
    return db.collection('users').doc(userId).get().then(userDoc => {
        if (userDoc.exists) {
            return userDoc.data().name; // Asumiendo que el campo se llama 'name'
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
            // ... otros campos que necesites ...
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

                // Actualizar la UI aquí
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `
                <p><strong>${commentData.userName}</strong> </p>
                <p>${commentText}</p>
                <span>${formattedTimeAgo}</span>
            `;

                // Agregar el comentario a la lista de comentarios
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
