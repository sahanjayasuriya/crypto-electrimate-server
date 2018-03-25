(function (system) {
    var admin = require('firebase-admin');
    var firebaseClient = require('firebase');
    var config = {
        apiKey: "AIzaSyAEhfekDFXXKGR-N_HHgB8lsSbHvqU5TrM",
        authDomain: "electrimate-dev.firebaseapp.com",
        databaseURL: "https://electrimate-dev.firebaseio.com",
        projectId: "electrimate-dev",
        storageBucket: "electrimate-dev.appspot.com",
        messagingSenderId: "47687875497"
    };
    firebaseClient.initializeApp(config);
    var serviceAccount = require('../electrimate-dev-firebase-adminsdk-te802-9026d47ec1');
    var firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://electrimate-dev.firebaseio.com"
    });
    var database = firebaseAdmin.database();

    system.firebaseAdmin = firebaseAdmin;
    system.database = database;
})(module.exports);