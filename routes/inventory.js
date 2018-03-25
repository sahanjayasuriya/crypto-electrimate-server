(function (routes) {
    var inventoryController = require('../controllers/inventory-controller');
    var prefix = '/api/v1/inventory';

    routes.init = function (app) {
        app.post(prefix + '/modules', inventoryController.addInventoryModules);
        app.get(prefix + '/modules/get/list', inventoryController.getInventoryModulesList);
        app.get(prefix + '/modules/get/batches', inventoryController.getInventoryModulesBatches);
    }

})(module.exports);
