document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('myform');
    var messageSentDiv = document.getElementById('message-sent'); // Gets the "SENT!" message div
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get('category');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // This authentication state listener should be registered once, not on every form submit.
        // If needed, place this listener outside and use a variable to store the user state.
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
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
                    form.style.display = 'none';
                    messageSentDiv.style.display = 'block';

                    // Redirect the user to the message board page with the correct category
                    setTimeout(function () {
                        window.location.href = `message_board.html?category=${category}`;
                    }, 3000); // Redirects after 3 seconds
                }).catch(function (error) {
                    console.error('Error adding post: ', error);
                });
            } else {
                console.error('User not signed in.');
                // Here you could, for example, display an error message or redirect to the login page.
            }
        });
    });
});

var ImageFile;
function listenFileSelect() {
      // listen for file selection
      var fileInput = document.getElementById("media-input"); // pointer #1
      const image = document.getElementById("media"); // pointer #2

			// When a change happens to the File Chooser Input
      fileInput.addEventListener('change', function (e) {
          ImageFile = e.target.files[0];   //Global variable
          var blob = URL.createObjectURL(ImageFile);
          image.src = blob; // Display this image
      })
}
listenFileSelect();
