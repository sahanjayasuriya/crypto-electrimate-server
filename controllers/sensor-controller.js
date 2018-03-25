(function (sensorController) {
    var config = require('../config/config');

    var firebaseAdmin = config.firebaseAdmin;
    var firebaseClient = require('firebase');
    var database = config.database;

    sensorController.getByModule = function (req, res) {
        database.ref('modules/').once('value')
            .then(function (snapshot) {
                res.send(snapshot)
                res.status(200)
                res.end()
            })
            .catch(function (err) {
                console.log(err);
                res.status(500)
                res.end();
            })
    }

})(module.exports);