var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {

                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                            //get the data fields of the user
                            var userName = userDoc.data().name;
                            var userCountry = userDoc.data().country;
                        
                            //if the data fields are not empty, then write them in to the form.
                            if (userName != null) {
                                document.getElementById("nameInput").value = userName;
                            }
                            if (userSchool != null) {
                                document.getElementById("countryInput").value = userCountry;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
            });
        }

//call the function to run it 
populateUserInfo();

onclick="editUserInfo()"    //event-listener that call the function editUserInfo after clicking on the button.

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    // get user entered values
    userName = document.getElementById('nameInput').value; //get the value of the field with id="nameInput"
    userCountry = document.getElementById('countryInput').value; //get the value of the field with id="countryInput"
    
    // update user's document in Firestore
    currentUser.update({
        name: userName,
        country: userCountry,
    })
    .then(() => {
        console.log("Document successfully updated!");
    })

    // disable edit
    document.getElementById('personalInfoFields').disabled = true;
}