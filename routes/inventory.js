(function (routes) {
    var inventoryController = require('../controllers/inventory-controller');
    var prefix = '/api/v1/inventory';

    routes.init = function (app) {
        app.post(prefix + '/module', inventoryController.addInventoryModule);
        app.get(prefix + '/module/get', inventoryController.getInventoryModule);
        app.get(prefix + '/module/get/list', inventoryController.getInventoryModuleList);
        app.delete(prefix + '/module', inventoryController.deleteInventoryModule);
    }

})(module.exports);
