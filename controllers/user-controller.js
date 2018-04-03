(function (userController) {
    var config = require('../config/config');

    var firebaseAdmin = config.firebaseAdmin;
    var firebaseClient = require('firebase');
    var database = config.database;

    /**
     * Function to save a new user to firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.addUser = function (req, res) {
        // Calling firebase auth create user api with required parameters
        firebaseAdmin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            displayName: req.body.displayName
        }).then(function (data) {
            // Creating a custom token
            firebaseAdmin.auth().createCustomToken(data.uid)
                .then(function (token) {
                    // Signing in to the created user account with the custom token
                    firebaseClient.auth().signInWithCustomToken(token)
                        .then(function (user) {
                            // Sending the verification email
                            user.sendEmailVerification()
                                .then(function (value) {
                                    // Signing out
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
            //Adding the new user to firebase database
            database.ref('users/' + data.uid).set({
                email: data.email,
                userType: 'HOUSE-OWNER',
                firstLogin: true
            }).catch(function (err) {
                res.send(err.message);
                res.status(500);
                res.end();
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

    /**
     * Function to return a user which has the user id in request url
     * This method is not secured with any HTTP security implementation
     */
    userController.getUser = function (req, res) {
        // Calling the firebase auth get user api
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

    /**
     * Function to return a list of users in firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.getUserList = function (req, res) {
        var list = [];
        // Calling firebase auth list users api
        firebaseAdmin.auth().listUsers()
            .then(function (data) {
                data.users.forEach(function (user, index) {
                    // Getting the user object in database associated with the auth user object
                    database.ref('users/' + user.uid).once('value')
                        .then(function (userData) {
                            //Adding the users to the list except admin users
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

    /**
     * Function to disable a user in firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.disableUser = function (req, res) {
        // Calling firebase auth update user with disabled parameter set to true
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

    /**
     * Function to disable a user in firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.enableUser = function (req, res) {
        // Calling firebase auth update user with disabled parameter set to false
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

    /**
     * Function to update a user in firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.updateUser = function (req, res) {
        var updateJson = {};

        // Checking if display name and phone number exist to update
        if (req.body.displayName && req.body.displayName != undefined && req.body.displayName != '') {
            updateJson['displayName'] = req.body.displayName;
        }
        if (req.body.phoneNumber && req.body.phoneNumber != undefined && req.body.phoneNumber != '') {
            updateJson['phoneNumber'] = req.body.phoneNumber;
        }

        if (Object.keys(updateJson).length != 0) {
            // Calling firebase auth update user
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

    /**
     * Function to reset password of a user in firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.resetPassword = function (req, res) {
        // Calling the firebase auth update user api with the new password
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
    };

    /**
     * Function to delete a user from firebase auth
     * This method is not secured with any HTTP security implementation
     */
    userController.deleteUser = function (req, res) {
        // Calling the firebase auth delete user api with the user id as parameter
        firebaseAdmin.auth().deleteUser(req.query.id)
            .then(function (data) {
                // Removing the user record associated with the deleted user from the database
                database.ref('users/' + req.query.id).remove()
                    .then(function (data) {
                        res.send(data);
                        res.status(200);
                        res.end();
                    }).catch(function (e) {
                    console.log(e);
                    res.status(500);
                    res.end();
                });
            })
            .catch(function (err) {
                console.log(err);
                res.status(500);
                res.end();
            })
    };


})(module.exports);