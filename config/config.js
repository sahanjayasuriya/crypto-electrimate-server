(function (system) {
    var admin = require('firebase-admin');
    var firebaseClient = require('firebase');
    var config = {
        apiKey: "AIzaSyDoC0bAwzEjdHXp-Ha630xrUNYrnCeo9VU",
        authDomain: "electrimate-demo.firebaseapp.com",
        databaseURL: "https://electrimate-demo.firebaseio.com",
        projectId: "electrimate-demo",
        storageBucket: "electrimate-demo.appspot.com",
        messagingSenderId: "947150330944"
    };
    firebaseClient.initializeApp(config);
    var serviceAccount = require('../electrimate-demo-firebase-adminsdk-15s77-454145a4f5');
    var firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://electrimate-demo.firebaseio.com"
    });
    var database = firebaseAdmin.database();

    system.firebaseAdmin = firebaseAdmin;
    system.database = database;
})(module.exports);