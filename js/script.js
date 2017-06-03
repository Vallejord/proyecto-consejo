  
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAZamzz-laOHL6cG6UHDfFofnhc5qwwfRk",
    authDomain: "web-consejo.firebaseapp.com",
    databaseURL: "https://web-consejo.firebaseio.com",
    projectId: "web-consejo",
    storageBucket: "web-consejo.appspot.com",
    messagingSenderId: "682982771183"
  };
  firebase.initializeApp(config);

  

window.onload = function() {
  var url = window.location.pathname;
  var currLoc = url.substring(url.lastIndexOf('/')+1);

  initApp(currLoc);
  console.log(currLoc);
};
/**
* Function called when clicking the Login/Logout button.
*/
// [START buttoncallback]
function toggleSignIn() {
  if (!firebase.auth().currentUser) {
    // [START createprovider]
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START addscopes]
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // [END addscopes]
    // [START signin]
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // [START_EXCLUDE]
      //document.getElementById('quickstart-oauthtoken').textContent = token;
      // [END_EXCLUDE]
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
      // [END_EXCLUDE]
    });
    // [END signin]
  } else {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  }
  // [START_EXCLUDE]
  document.getElementById('loginBtn').disabled = true;
  // [END_EXCLUDE]
}

function initApp(currLoc) {
  // Escuchamos si cambia el estado del usuario

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User logueado
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;

      $('#loginBtn').text('Cerrar sesión');
      //if(currLoc != 'user.html') window.location.href = 'user.html';

      $('#user').text(displayName);
      $('#avatar').attr('src', photoURL);
      $('#text').html('User ID: <small>'+uid+'</small><br>Email: <a href="mailto:'+email+'">'+email+'</a><br>Proveedor: '+providerData[0]['providerId']);

    } else {
      // User is signed out.
      $('#loginBtn').text('Iniciar sesión con Google');
      if(currLoc != 'index.html') window.location.href = 'index.html';
    }

    document.getElementById('loginBtn').disabled = false;

  });

  document.getElementById('loginBtn').addEventListener('click', toggleSignIn, false);
}
