(function (inventoryController) {
    var config = require('../config/config');
    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    inventoryController.addInventoryModules = function (req, res) {
        var succcess = 0;
        var failed = 0;
        var batches =[]
        database.ref('inventory/modulebatches').once('value', function (data) {

        }).then(function (data) {
            if(data.val() != null){
                batches = data.val();
            }
            batches.push(req.body.batchNumber);
            database.ref('inventory/modulebatches').set(
                batches
            ).then(function (data) {
                for(var i = 0; i < req.body.moduleCount; i++){
                    database.ref('inventory/modules/').push().set({
                        batchNumber: req.body.batchNumber
                    }).then(function (data) {
                        succcess++;
                    }).catch(function (err) {
                        failed++;
                    });

                    if(i == (req.body.moduleCount - 1)){
                        if(failed == req.body.moduleCount){
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

    inventoryController.getInventoryModulesList = function (req, res) {
        const batch = req.query.batch;
        database.ref('inventory/modules').once('value', function () {

        }).then(function (data) {

            var modules = data.val();
            var keys = Object.keys(modules);
            var resArray = [];

            for(var i = 0; i < keys.length; i++){
                var k = keys[i];
                var batchNumber = modules[k].batchNumber;
                if(batchNumber == batch){
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


})(module.exports);