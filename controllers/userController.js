(function (userController) {
    var s = require('../config/config');

    var firebaseAdmin = s.firebaseAdmin;
    var database = s.database;

    userController.addUser = function (req, res) {
        firebaseAdmin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
            displayName: req.body.displayName
        }).then(function (data) {
            firebaseAdmin.auth().createCustomToken(data.uid)
                .then(function (token) {
                    firebaseClient.auth().signInWithCustomToken(token)
                        .then(function (user) {
                            user.sendEmailVerification()
                                .then(function (value) {
                                    firebaseClient.auth().signOut();
                                })
                                .catch(function (reason) {
                                    console.log(reason);
                                });
                        })
                        .catch(function (err) {
                            console.log(err);
                        })
                })
                .catch(function (err) {
                    console.log(err);
                });
            database.ref('users/' + data.uid).set({
                email: data.email,
                userType: 'HOUSE-OWNER',
                firstLogin: true
            }).catch(function (err) {
                console.log(err);
            });
            res.send(data);
            res.status(201);
            res.end();
        }).catch(function (e) {
            console.log(e);
            res.status(500);
            res.end();
        })
    };

    userController.getUser = function (req, res) {
        firebaseAdmin.auth().getUser(req.query.id)
            .then(function (data) {
                res.send(data);
                res.status(200);
                res.end();
            })
            .catch(function (err) {
                res.status(404);
                res.end();
            })
    };

    userController.getUserList = function (req, res) {
        var list = [];
        firebaseAdmin.auth().listUsers()
            .then(function (data) {
                data.users.forEach(function (user, index) {
                    database.ref('users/' + user.uid).once('value')
                        .then(function (userData) {
                            if (userData.val().userType != 'ADMIN') {
                                var userObj = {
                                    "id": user.uid,
                                    "displayName": user.displayName,
                                    "email": user.email,
                                    "phoneNumber": user.phoneNumber,
                                    "photoURL": user.photoURL,
                                    "userType": userData.val().userType,
                                    "disabled": user.disabled,
                                    "emailVerified": user.emailVerified,
                                    "firstLogin": userData.val().firstLogin,
                                    "lastSignInTime": user.metadata.lastSignInTime,
                                    "creationTime": user.metadata.creationTime
                                };
                                list.push(userObj);
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

    userController.disableUser = function (req, res) {
        firebaseAdmin.auth().updateUser(req.body.id, {disabled: true}
        )
            .then(function (data) {
                res.send(data);
                res.status(200);
                res.end();
            })
            .catch(function (err) {
                console.log(err);
                res.status(500);
                res.end();
            })
    };

    userController.enableUser = function (req, res) {
        firebaseAdmin.auth().updateUser(req.body.id, {disabled: false}
        )
            .then(function (data) {
                res.send(data);
                res.status(200);
                res.end();
            })
            .catch(function (err) {
                console.log(err);
                res.status(500);
                res.end();
            })
    };

    userController.updateUser = function (req, res) {
        var updateJson = {};

        if (req.body.displayName && req.body.displayName != undefined && req.body.displayName != '') {
            updateJson['displayName'] = req.body.displayName;
        }
        if (req.body.phoneNumber && req.body.phoneNumber != undefined && req.body.phoneNumber != '') {
            updateJson['phoneNumber'] = req.body.phoneNumber;
        }

        if (Object.keys(updateJson).length != 0) {
            firebaseAdmin.auth().updateUser(req.body.id, updateJson)
                .then(function (data) {
                    res.send(data);
                    res.status(200);
                    res.end();
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(500);
                    res.end();
                })
        }
    };

    userController.resetPassword = function (req, res) {
        firebaseAdmin.auth().updateUser(req.body.id, {password: req.body.password})
            .then(function (data) {
                res.send(data);
                res.status(200);
                res.end();
            })
            .catch(function (err) {
                console.log(err);
                res.status(500);
                res.end();
            })
    }

    userController.deleteUser = function (req, res) {
        firebaseAdmin.auth().deleteUser(req.query.id)
            .then(function (data) {
                res.send(data);
                res.status(200);
                res.end();
            })
            .catch(function (err) {
                console.log(err);
                res.status(500);
                res.end();
            })
    }


})(module.exports);