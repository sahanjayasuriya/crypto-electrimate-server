(function (rawDataController) {

    var s = require('../config/config');

    var firebaseAdmin = s.firebaseAdmin;
    var database = s.database;

    rawDataController.save = function (req, res) {
        console.log(req.body);
        var raw = {};
        req.body.raw.forEach(function (value) {
            console.log(value);
            var newKey = database.ref('sensors/' + req.body.sensorId + '/raw').push().key;
            raw['/' + newKey] = value;
        });
        database.ref('sensors/' + req.body.sensorId + '/raw').update(raw)
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

    rawDataController.get = function (req, res) {
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