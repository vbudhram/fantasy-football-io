/**
 * Master Controller
 */

'use strict';
app.controller('MasterCtrl', ['$scope', '$http', '$rootScope', 'cfpLoadingBar', '$location', '$cookieStore', '$window', 'UserService', function ($scope, $http, $rootScope, cfpLoadingBar, $location, $cookieStore, $window, UserService) {
    /**
     * Sidebar Toggle & Cookie Control
     *
     */
    var mobileView = 992;

    $scope.getWidth = function () {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function (newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                if ($cookieStore.get('toggle') == false) {
                    $scope.toggle = false;
                }
                else {
                    $scope.toggle = true;
                }
            }
            else {
                $scope.toggle = true;
            }
        }
        else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function () {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function () {
        $scope.$apply();
    };

    $scope.init = function init() {
        console.log("Initalizing controller");
        $scope.user = UserService.getCurrentUser();
        $scope.signup = undefined;
    };

    $scope.login = function login() {
        cfpLoadingBar.start();
        $scope.login.error = '';
        UserService.login($scope.login.email, $scope.login.password).then(function (data) {
            $scope.$parent.user = data;
            $location.path('#/news');
        }, function (err) {
            $scope.login.error = err;
        });
    };

    $scope.logout = function logout() {
        cfpLoadingBar.start();
        UserService.logout().then(function (data) {
            cfpLoadingBar.complete();
            $scope.user = undefined;
            $location.path('/login');
        }, function (err) {
            $location.path('/login');
        });
    };

    $scope.signup = function () {
        console.log('Signing up user');

        if (!validateEmail($scope.email)) {
            $scope.error = 'Please enter a valid email.';
        } else if ($scope.password === undefined) {
            $scope.error = 'Please enter a password.';
        } else if ($scope.password !== $scope.confirm) {
            $scope.error = 'Passwords do not match.';
        } else {
            cfpLoadingBar.start();

            $http({
                method: 'post',
                url: '/users',
                data: {email: $scope.email, password: $scope.password}
            }).success(function (data, status, headers, config) {
                $scope.user = $scope.email;
                $cookieStore.put('user', data);
                cfpLoadingBar.complete();
                $scope.signup = undefined;
                $location.path('/news');
            }).error(function (data, status, headers, config) {
                cfpLoadingBar.complete();
                $scope.error = data;
            });
        }

    };

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}]);
