(function (routes) {
    var userController = require('../controllers/user-controller');
    var prefix = '/api/v1/user';

    routes.init = function (app) {
        app.post(prefix + '', userController.addUser);
        app.get(prefix + '/get', userController.getUser);
        app.get(prefix + '/get/list', userController.getUserList);
        app.put(prefix + '/update/disable', userController.disableUser);
        app.put(prefix + '/update/enable', userController.enableUser);
        app.put(prefix + '', userController.updateUser);
        app.post(prefix + '/password/reset', userController.resetPassword);
        app.delete(prefix + '', userController.deleteUser);
    }

})(module.exports);
