(function (routes) {
    var users = require('./users');
    var mainController = require('../controllers/mainController');
    var prefix = '/api/v1';

    routes.init = function (app) {
        users.init(app);
    }

})(module.exports);
