/**
 * Created by vbudhram on 9/13/14.
 */
'use strict';
app.controller('LoginCtrl', ['$scope', '$location', 'UserService', '$rootScope', function ($scope, $location, UserService, $rootScope) {

    $scope.init = function init(){
        $scope.logout();
    };

    $scope.login = function login() {
        $scope.login.error = '';
        UserService.login($scope.login.email, $scope.login.password).then(function (data) {
            $rootScope.$broadcast('login', data);
            $location.path('/news');
        }, function (err) {
            $scope.login.error = err;
        });
    };

    $scope.logout = function logout() {
        UserService.logout().then(function (data) {
            $rootScope.$broadcast('logout', data);
            $location.path('/login');
        }, function (err) {
            $location.path('/login');
        });
    };
}]);