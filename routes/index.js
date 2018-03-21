(function (routes) {
    var users = require('./users');
    var rawData = require('./rawData');
    var prefix = '/api/v1';

    routes.init = function (app) {
        users.init(app);
        rawData.init(app);
    }

})(module.exports);
