(function (routes) {
    var users = require('./users');
    var rawData = require('./rawdata');
    var modules = require('./modules');
    var inventory = require('./inventory');
    var prefix = '/api/v1';

    routes.init = function (app) {
        users.init(app);
        rawData.init(app);
        modules.init(app);
        inventory.init(app);
    }

})(module.exports);
