//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyAR3eEnEl0KoqReRpsQEhBzig4LFtFC4IE",
    authDomain: "comp1800-dtc11.firebaseapp.com",
    projectId: "comp1800-dtc11",
    storageBucket: "comp1800-dtc11.appspot.com",
    messagingSenderId: "943216741370",
    appId: "1:943216741370:web:410909938860a210b67243"
  };

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();