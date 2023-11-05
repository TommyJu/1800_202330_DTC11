document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('myform');
    var messageSentDiv = document.getElementById('message-sent'); // Obtiene el div del mensaje "SENT!"
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get('category');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Listener for authentication state changes
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is authenticated, gets the user's ID
                var userId = user.uid;

                var title = document.getElementById('title').value;
                var description = document.getElementById('description').value;
                var media = document.getElementById('media').files[0];

                var postData = {
                    title: title,
                    description: description,
                    category: category,
                    userId: userId,
                    // The URL of the uploaded file will go here
                };

                // The rest of the code to add to Firestore
                db.collection('allPosts').add(postData).then(function () {
                    console.log('Post added successfully!');
                    // Oculta el formulario
                    form.style.display = 'none';
                    // Muestra el mensaje "SENT!"
                    messageSentDiv.style.display = 'block';
                    // Establece un temporizador para redireccionar
                    setTimeout(function () {
                        window.location.href = 'message_board.html'; // Cambia esto por la URL real de tu message board
                    }, 3000); // Redirecciona después de 3 segundos
                }).catch(function (error) {
                    console.error('Error adding post: ', error);
                });
            } else {
                // User is not authenticated, handle the situation here
                console.error('User not signed in.');
                // Here you can, for example, display an error message or redirect to the login page
            }
        });
    });
});
