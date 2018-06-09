(function(){
    var config = {
        apiKey: "AIzaSyA3WJ9OM4djaPCTRGvF2qaeh_hE4qXQ8DU",
        authDomain: "plato-7fb01.firebaseapp.com",
        databaseURL: "https://plato-7fb01.firebaseio.com",
        projectId: "plato-7fb01",
        storageBucket: "plato-7fb01.appspot.com",
        messagingSenderId: "1064887107825"
    };
     firebase.initializeApp(config);
     var docRef = db.collection("Rests").doc("/RestID/Orders/uHN9bSdMnEMpFqVpzdNX");
    docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data());
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
});
    // angular.module("plato",['firebase']).controller('myCon',function($firebaseObject){
    //         const rootRef = firebase.database().ref().child('Rests');
    //         const ref = rootRef.child('RestID').child('Dishes');
    //         this.object = $firebaseObject(ref);
    // });

    //dish status

}());   