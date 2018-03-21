(function (routes) {
    var users = require('./users');
    var rawData = require('./rawdata');
    var modules = require('./modules');
    var prefix = '/api/v1';

    routes.init = function (app) {
        users.init(app);
        rawData.init(app);
        modules.init(app);
    }

})(module.exports);
