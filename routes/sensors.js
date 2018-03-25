(function (routes) {
    var moduleController = require('../controllers/module-controller');
    var prefix = '/api/v1/module';

    routes.init = function (app) {
        app.post(prefix + 'getByModule', moduleController.getByModule);
    }

})(module.exports);
