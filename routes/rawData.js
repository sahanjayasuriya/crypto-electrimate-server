(function (routes) {
    var rawDataController = require('../controllers/rawDataController');
    var prefix = '/api/v1/raw-data';

    routes.init = function (app) {
        app.post(prefix + '', rawDataController.save);
        app.get(prefix + '', rawDataController.get)
    }

})(module.exports);
