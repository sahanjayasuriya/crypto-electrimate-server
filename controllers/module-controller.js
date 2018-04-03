(function (moduleController) {
    var config = require('../config/config');
    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    var moduleMeta = {
        id: "",
        uid: "",
        moduleCode: "",
        moduleName: "",
        sensorCount: 0
    };

    /**
     * Function to save a module to the database
     * This method is not secured with any HTTP security implementation
     */
    moduleController.addModule = function (req, res) {
        // Preparing a js date object to the required format
        var date = new Date();
        var year = date.getFullYear();
        var month = (date.getMonth() + 1) < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        var day = date.getDate();
        var hours = date.getHours();
        var dateString = year + '-' + month + '-' + day + 'T' + hours + ':00:00Z';

        // Getting the module object from the database and adding the module name field
        database.ref('modules/' + req.body.moduleCode).update({
            moduleName: req.body.moduleName
        }).then(function (data) {
            // Creating a bills array and pushing a new bill object
            database.ref('modules/' + req.body.moduleCode + '/bills').push({
                current: true,
                from: dateString
            }).catch(function (err) {
                console.log(err);
            });
            // Adding the saved module if to the users modules array
            database.ref('users/' + req.body.id + '/modules/').set(
                [req.body.moduleCode]
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

    /**
     * Function to return a module which has the user id in request url
     * This method is not secured with any HTTP security implementation
     */
    moduleController.getModule = function (req, res) {
        // Retrieving the module id from database with the provided user id
        database.ref('users/' + req.query.id).once('value', function () {
        }).then(function (data) {
            var userData = data.val();
            // Retrieving module from database with the module id taken from previous step
            database.ref('modules/' + userData.modules[0]).once('value', function () {
            }).then(function (mData) {
                var moduleData = mData.val();
                // Preparing module object to send with the response
                var moduleObject = {
                    id: userData.modules[0],
                    uid: req.query.id,
                    moduleCode: moduleData.moduleCode,
                    moduleName: moduleData.moduleName,
                    enabled: moduleData.enabled,
                    sensorCount: moduleData.sensors == null ? 0 : moduleData.sensors.length
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

    /**
     * Function to return a list of modules in firebase database
     * This method is not secured with any HTTP security implementation
     */
    moduleController.getModuleList = function (req, res) {
        var list = [];
        // Getting the list of users from firebase auth
        firebaseAdmin.auth().listUsers()
            .then(function (data) {
                data.users.forEach(function (user, index) {
                    // Getting user object from database associated with the auth user
                    database.ref('users/' + user.uid).once('value')
                        .then(function (userData) {
                            if (userData.val().modules != undefined) {
                                // Getting the module from the database with the module id in the user object
                                database.ref('modules/' + userData.val().modules[0]).once('value', function () {
                                }).then(function (mData) {
                                    var moduleData = mData.val();
                                    // Preparing the object to be sent with the response
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

    /**
     * Function to disable a module in firebase database
     * This method is not secured with any HTTP security implementation
     */
    moduleController.disableModule = function (req, res) {
        // Getting the user object from the database with the user id in request body
        database.ref('users/' + req.body.id).once('value', function () {
        }).then(function (data) {
            var userData = data.val();
            // Setting the enabled property to false in the module object
            database.ref('modules/' + userData.modules[0]).update({
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

    /**
     * Function to enable a module in firebase database
     * This method is not secured with any HTTP security implementation
     */
    moduleController.enableModule = function (req, res) {
        // Getting the user object from the database with the user id in request body
        database.ref('users/' + req.body.id).once('value', function () {
        }).then(function (data) {
            var userData = data.val();
            // Setting the enabled property to true in the module object
            database.ref('modules/' + userData.modules[0]).update({
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

    /**
     * Function to update a module in firebase database
     * This method is not secured with any HTTP security implementation
     */
    moduleController.updateModule = function (req, res) {
        var updateJson = {
            "moduleCode": req.body.moduleCode,
            "moduleName": req.body.moduleName
        };
        // Getting the user object from the database with the user id in request body
        database.ref('users/' + req.body.id).once('value', function () {
        }).then(function (data) {
            var userData = data.val();
            // Updating the details of module object
            database.ref('modules/' + userData.modules[0]).update(updateJson).then(function (data) {
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

    /**
     * Function to delete a module from firebase database
     * This method is not secured with any HTTP security implementation
     */
    moduleController.deleteModule = function (req, res) {
        // Getting the user object from the database with the user id in request body
        database.ref('users/' + req.query.id).once('value', function () {
        }).then(function (data) {
            var userData = data.val();
            // Removing the module object from the database
            database.ref('modules/' + userData.modules[0]).remove()
                .then(function (data) {
                    // Removing the module id from the user object
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