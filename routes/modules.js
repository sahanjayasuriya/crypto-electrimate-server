(function (routes) {
    var moduleController = require('../controllers/module-controller');
    var prefix = '/api/v1/module';

    routes.init = function (app) {
        app.post(prefix + '', moduleController.addModule);
        app.get(prefix + '/get', moduleController.getModule);
        app.get(prefix + '/get/list', moduleController.getModuleList);
        app.put(prefix + '/update/disable', moduleController.disableModule);
        app.put(prefix + '/update/enable', moduleController.enableModule);
        app.put(prefix + '', moduleController.updateModule);
        app.delete(prefix + '', moduleController.deleteModule);
    }

})(module.exports);
