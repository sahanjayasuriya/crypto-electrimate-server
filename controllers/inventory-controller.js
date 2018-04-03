(function (inventoryController) {
    var config = require('../config/config');
    var database = config.database;

    /**
     * Save new Modules to the Database
     * This method is not secured with any HTTP security implementation
     */
    inventoryController.addInventoryModules = function (req, res) {
        var success = 0;
        var failed = 0;
        var batches = []
        database.ref('inventory/modulebatches').once('value', function (data) {

        }).then(function (data) {
            if (data.val() != null) {
                batches = data.val();
            }
            // Add a new batch
            batches.push(req.body.batchNumber);
            database.ref('inventory/modulebatches').set(
                batches
            ).then(function (data) {
                // save modules
                for (var i = 0; i < req.body.moduleCount; i++) {
                    database.ref('modules/').push().set({
                        batchNumber: req.body.batchNumber
                    }).then(function (data) {
                        success++;
                    }).catch(function (err) {
                        failed++;
                    });

                    // check for all modules are saved
                    if (i == (req.body.moduleCount - 1)) {
                        if (failed == req.body.moduleCount) {
                            res.status(500);
                            res.end();
                        } else {
                            res.status(200);
                            res.end();
                        }
                    }
                }
            }).catch(function (err) {
                res.status(500);
                res.end();
            });
        });
    };

    /**
     * Returns a JSON object of Modules array from Database
     * This method is not secured with any HTTP security implementation
     */
    inventoryController.getInventoryModulesList = function (req, res) {
        const batch = req.query.batch;
        database.ref('modules').once('value', function () {

        }).then(function (data) {

            var modules = data.val();
            var keys = Object.keys(modules);
            var resArray = [];

            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var batchNumber = modules[k].batchNumber;
                if (batchNumber == batch) {
                    resArray.push({id: k, batchNumber: batchNumber});
                }
            }
            res.send(resArray);
            res.status(200);
            res.end();
        }).catch(function (err) {
            console.log(err);
            res.send(err.message);
            res.status(500);
            res.end();
        });
    };

    /**
     * Returns a JSON object of Module Batches
     * This method is not secured with any HTTP security implementation
     */
    inventoryController.getInventoryModulesBatches = function (req, res) {
        database.ref('inventory/modulebatches').once('value', function (data) {

        }).then(function (data) {
            res.send(data.val());
            res.status(200);
            res.end();
        }).catch(function (err) {
            res.status(500);
            res.end();
        });
    };

    /**
     * Save new Sensors to the Inventory
     * This method is not secured with any HTTP security implementation
     */
    inventoryController.addInventorySensors = function (req, res) {
        var succcess = 0;
        var failed = 0;
        var batches = []
        database.ref('inventory/sensorbatches').once('value', function (data) {

        }).then(function (data) {
            if (data.val() != null) {
                batches = data.val();
            }
            batches.push(req.body.batchNumber);
            database.ref('inventory/sensorbatches').set(
                batches
            ).then(function (data) {
                for (var i = 0; i < req.body.sensorCount; i++) {
                    database.ref('sensors/').push().set({
                        batchNumber: req.body.batchNumber
                    }).then(function (data) {
                        succcess++;
                    }).catch(function (err) {
                        failed++;
                    });

                    if (i == (req.body.sensorCount - 1)) {
                        if (failed == req.body.sensorCount) {
                            res.status(500);
                            res.end();
                        } else {
                            res.status(200);
                            res.end();
                        }
                    }
                }
            }).catch(function (err) {
                res.status(500);
                res.end();
            });
        });
    };


    /**
     * Returns a JSON object of Sensors
     * This method is not secured with any HTTP security implementation
     */
    inventoryController.getInventorySensorsList = function (req, res) {
        const batch = req.query.batch;
        database.ref('sensors').once('value', function () {

        }).then(function (data) {

            var sensors = data.val();
            var keys = Object.keys(sensors);
            var resArray = [];

            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var batchNumber = sensors[k].batchNumber;
                if (batchNumber == batch) {
                    resArray.push({id: k, batchNumber: batchNumber});
                }
            }
            res.send(resArray);
            res.status(200);
            res.end();
        }).catch(function (err) {
            console.log(err);
            res.send(err.message);
            res.status(500);
            res.end();
        });
    };

    /**
     * Returns a JSON object of Sensor Batches
     * This method is not secured with any HTTP security implementation
     */
    inventoryController.getInventorySensorsBatches = function (req, res) {
        database.ref('inventory/sensorbatches').once('value', function (data) {

        }).then(function (data) {
            res.send(data.val());
            res.status(200);
            res.end();
        }).catch(function (err) {
            res.status(500);
            res.end();
        });
    };


})(module.exports);