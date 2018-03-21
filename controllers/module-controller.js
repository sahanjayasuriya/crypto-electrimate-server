(function (moduleController) {
    var config = require('../config/config');
    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    moduleController.addModule = function (req, res) {
        var ref = database.ref('modules/').push()
        ref.set({
            serialNo: req.body.serialNo,
            moduleName: req.body.moduleName
        }).then(function (data) {

            database.ref('users/' + req.body.uid + '/modules/').push().set(
                ref.getKey()
            ).catch(function (err) {
                console.log(err);
            });
            res.send(ref.getKey());
            res.status(201);
            res.end();
        }).catch(function (err) {
            console.log(err);
            res.status(500);
            res.end();
        });

    };

    moduleController.getModule = function (req, res) {

    };

    moduleController.getModuleList = function (req, res) {

    };

    moduleController.disableModule = function (req, res) {

    };

    moduleController.enableModule = function (req, res) {

    };

    moduleController.updateModule = function (req, res) {

    };

    moduleController.deleteModule = function (req, res) {

    };


})(module.exports);