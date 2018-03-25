(function (rawDataController) {

    var config = require('../config/config');

    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    rawDataController.save = function (req, res) {
        console.log(req.body);
        var count = 0;
        req.body.forEach(function (value) {
            console.log(value);
            var raw = {};
            value.raw.forEach(function (value2) {
                var newKey = database.ref('sensors/' + value.serialNumber + '/raw').push().key;
                raw['/' + newKey] = value2;
            });
            database.ref('sensors/' + value.serialNumber + '/raw').update(raw)
                .then(function (snapshot) {
                    count++;
                    if (count == req.body.length) {
                        res.send(snapshot);
                        res.status(200);
                        res.end()
                    }
                })
                .catch(function (err) {
                    count++;
                    if (count == req.body.length) {
                        console.log(err);
                        res.status(500);
                        res.end();
                    }
                })
        });
    };

})(module.exports);