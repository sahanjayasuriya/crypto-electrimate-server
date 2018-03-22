(function (moduleController) {
    var config = require('../config/config');
    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    var moduleMeta = {
        id:"",
        uid:"",
        moduleCode:"",
        moduleName:"",
        sensorCount:0,
        enabled: false
    };

    moduleController.addModule = function (req, res) {
        var ref = database.ref('modules/').push()
        ref.set({
            moduleCode: req.body.moduleCode,
            moduleName: req.body.moduleName,
            enabled: true
        }).then(function (data) {
            database.ref('users/' + req.body.uid + '/modules/').set(
                [ref.getKey()]
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
        database.ref('users/'+req.query.uid).once('value', function () {

        }).then(function (data) {

            var userData = data.val();

            database.ref('modules/'+userData.modules[0]).once('value', function () {

            }).then(function (mData) {
                var moduleData = mData.val();

                var moduleObject = {
                    id:userData.modules[0],
                    uid:req.query.uid,
                    moduleCode:moduleData.moduleCode,
                    moduleName:moduleData.moduleName,
                    enabled: moduleData.enabled,
                    sensorCount:moduleData.sensors == null? 0 : moduleData.sensors.length
                };

                res.status(200);
                res.send(moduleObject);
                res.end();
            }).catch(function (e) {
                console.log(e);
                res.status(500);
                res.end();
            });
        }).catch(function (e) {
            console.log(e);
            res.status(500);
            res.end();
        })
    };

    moduleController.getModuleList = function (req, res) {
        //TODO : Should be implemented if needed
    };

    moduleController.disableModule = function (req, res) {
        database.ref('users/'+req.body.id).once('value', function () {

        }).then(function (data) {

            var userData = data.val();

            database.ref('modules/'+userData.modules[0]).update({
                "enabled": false
            }).then(function (data) {
                res.status(200);
                res.send(data);
                res.end();
            }).catch(function (e) {
                console.log(e);
                res.status(500);
                res.end();
            });
        }).catch(function (e) {
            console.log(e);
            res.status(500);
            res.end();
        });
    };

    moduleController.enableModule = function (req, res) {
        database.ref('users/'+req.body.id).once('value', function () {

        }).then(function (data) {

            var userData = data.val();

            database.ref('modules/'+userData.modules[0]).update({
                "enabled": true
            }).then(function (data) {
                res.status(200);
                res.send(data);
                res.end();
            }).catch(function (e) {
                console.log(e);
                res.status(500);
                res.end();
            });
        }).catch(function (e) {
            console.log(e);
            res.status(500);
            res.end();
        });
    };

    moduleController.updateModule = function (req, res) {
        var updateJson = {
            "moduleCode": req.body.moduleCode,
            "moduleName": req.body.moduleName
        }

        database.ref('users/'+req.body.id).once('value', function () {

        }).then(function (data) {

            var userData = data.val();

            database.ref('modules/'+userData.modules[0]).update(updateJson).then(function (data) {
                res.status(200);
                res.send(data);
                res.end();
            }).catch(function (e) {
                console.log(e);
                res.status(500);
                res.end();
            });
        }).catch(function (e) {
            console.log(e);
            res.status(500);
            res.end();
        });

    };

    moduleController.deleteModule = function (req, res) {
        database.ref('users/' + req.query.id).once('value', function () {

        }).then(function (data) {

            var userData = data.val();

            database.ref('modules/' + userData.modules[0]).remove()
                .then(function (data) {
                    database.ref('users/' + req.query.id + '/modules').remove()
                        .then(function () {
                            res.send(data);
                            res.status(200);
                            res.end();
                        }).catch(function (e) {
                        console.log(e);
                        res.status(500);
                        res.end();
                    })
                }).catch(function (e) {
                console.log(e);
                res.status(500);
                res.end();
            });
        }).catch(function (e) {
            console.log(e);
            res.status(500);
            res.end();
        });
    };


})(module.exports);