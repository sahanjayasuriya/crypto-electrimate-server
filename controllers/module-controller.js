(function (moduleController) {
    var config = require('../config/config');
    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    var moduleMeta = {
        id:"",
        uid:"",
        moduleCode:"",
        moduleName:"",
        sensorCount:0
    };

    moduleController.addModule = function (req, res) {
        var ref = database.ref('modules/').push();
        ref.set({
            moduleCode: req.body.moduleCode,
            moduleName: req.body.moduleName
        }).then(function (data) {
            database.ref('users/' + req.body.id + '/modules/').set(
                [ref.getKey()]
            ).catch(function (err) {
                console.log(err);
            });
            res.send(data);
            res.status(201);
            res.end();
        }).catch(function (err) {
            console.log(err);
            res.status(500);
            res.end();
        });

    };

    moduleController.getModule = function (req, res) {
        database.ref('users/'+req.query.id).once('value', function () {

        }).then(function (data) {

            var userData = data.val();

            database.ref('modules/'+userData.modules[0]).once('value', function () {

            }).then(function (mData) {
                var moduleData = mData.val();

                var moduleObject = {
                    id:userData.modules[0],
                    uid:req.query.id,
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
        var list = [];
        firebaseAdmin.auth().listUsers()
            .then(function (data) {
                data.users.forEach(function (user, index) {
                    database.ref('users/' + user.uid).once('value')
                        .then(function (userData) {
                            if(userData.val().modules != undefined){

                                database.ref('modules/'+userData.val().modules[0]).once('value', function () {

                                }).then(function (mData) {
                                    var moduleData = mData.val();

                                    var userObj = {
                                        "id": user.uid,
                                        "displayName": user.displayName,
                                        "email": user.email,
                                        "phoneNumber": user.phoneNumber,
                                        "enabled": moduleData.enabled,
                                        "moduleCode": moduleData.moduleCode,
                                        "moduleName": moduleData.moduleName
                                    };
                                    list.push(userObj);
                                }).catch(function (e) {
                                    console.log(e);
                                })
                            }
                            if (index === data.users.length - 1) {
                                res.send(list);
                                res.status(200);
                                res.end();
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                        })
                });
            })
            .catch(function (err) {
                res.status(404);
                res.end();
            });
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