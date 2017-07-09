
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAZamzz-laOHL6cG6UHDfFofnhc5qwwfRk",
    authDomain: "web-consejo.firebaseapp.com",
    databaseURL: "https://web-consejo.firebaseio.com",
    projectId: "tu consejo",
    storageBucket: "web-consejo.appspot.com",
    messagingSenderId: "682982771183"
  };
  firebase.initializeApp(config);



  var displayName;
  var email;
  var emailVerified;
  var photoURL;
  var isAnonymous;
  var uid;
  var providerData;
  var starCount;
  var recentPostsSection = document.getElementById('recent-posts-list');
  var listeningFirebaseRefs = [];

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
        //console.log(user);

        displayName = user.displayName;
        email = user.email;
        emailVerified = user.emailVerified;
        photoURL = user.photoURL;
        isAnonymous = user.isAnonymous;
        uid = user.uid;
        providerData = user.providerData;

        $('#loginBtn').text('Cerrar sesión');

        // Si se conecto correctamente lo llevo a la pagina del usuario y puede ver los posts
        //if(currLoc != 'user.html') window.location.href = 'user.html';


        // traemos los posts desde firebase
        startDatabaseQueries();
        $('.userName').text(displayName);

      } else {
        // User is signed out.
        $('#loginBtn').text('Iniciar sesión');
        if(currLoc != 'index.php') window.location.href = 'index.php';
      }
      document.getElementById('loginBtn').disabled = false;
    });

    document.getElementById('loginBtn').addEventListener('click', toggleSignIn, false);
  }

  $('#fposts').on('submit', function(event){
    event.preventDefault();
    var body = $('#rbody').val();
    saveReclamo(body);
  });

  function saveReclamo(body) {
    var postData = {
      author: displayName,
      uid: uid,
      body: body,
      starCount: 0,
      authorPic: photoURL
    };
    var newPostKey = firebase.database().ref().child('posts').push().key;
    var updates = {};
    updates['/posts/' + newPostKey] = postData;
    updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    //window.location.href = 'mis-reclamos.html';
    var body = $('#rbody').val('');
    return firebase.database().ref().update(updates);
  }

  function createPostElement(postId, title, text, author, authorId, authorPic) {
    //var uid = firebase.auth().currentUser.uid;

    var html = '<div class="media post post-'+postId+'">\
    <img class="d-flex align-self-start mr-3" src="'+authorPic+'" alt="'+author+'">\
    <div class="media-body">\
    <p>'+text+'</p>\
    </div>\
    </div>'

    // Create the DOM element from the HTML.

    document.getElementById('mis-posts').innerHTML = html;
    var postElement = document.getElementById('mis-posts').firstChild;

    return postElement;
  }

  function startDatabaseQueries() {

    // [START recent_posts_query]
    var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    // [END recent_posts_query]

    var fetchPosts = function(postsRef, sectionElement) {
      postsRef.on('child_added', function(data) {
        var author = data.val().author || 'Anonymous';
        var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
        containerElement.insertBefore(
          createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
          containerElement.firstChild);
        });
        postsRef.on('child_changed', function(data) {
          var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
          var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
          postElement.getElementsByClassName('title')[0].innerText = data.val().title;
          postElement.getElementsByClassName('username')[0].innerText = data.val().author;
          postElement.getElementsByClassName('text')[0].innerText = data.val().body;
        });
        postsRef.on('child_removed', function(data) {
          var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
          var post = containerElement.getElementsByClassName('post-' + data.key)[0];
          post.parentElement.removeChild(post);
        });
      };

      // Fetching and displaying all posts of each sections.
      fetchPosts(recentPostsRef, recentPostsSection);

      // Keep track of all Firebase refs we are listening to.
      listeningFirebaseRefs.push(recentPostsRef);
    }
