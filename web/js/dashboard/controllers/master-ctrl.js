/**
 * Master Controller
 */

'use strict';
app.controller('MasterCtrl', ['$scope', '$http', '$rootScope', 'cfpLoadingBar', '$location', '$cookieStore', '$window', 'md5', 'UserService', function ($scope, $http, $rootScope, cfpLoadingBar, $location, $cookieStore, $window, md5, UserService) {
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
        $scope.user = $cookieStore.get('user');
        var imageUrl = $scope.avatarUrl = $scope.user ? ('http://www.gravatar.com/avatar/' + md5.createHash($scope.user.email)) : 'img/avatar.jpg';
        $scope.signup = undefined;
    };

    $scope.login = function login() {
        cfpLoadingBar.start();
        console.log('Logging in');
        $scope.login.error = '';
        $http({
            method: 'post',
            url: '/doLogin',
            data: {email: $scope.login.email, password: $scope.login.password}
        }).success(function (data, status, headers, config) {
            console.log('Completed login request');

            $scope.user = $scope.login.email;
            $cookieStore.put('user', data);
            cfpLoadingBar.complete();
            $window.location.href = '#/news';

        }).error(function (data, status, headers, config) {
            console.log(data);
            cfpLoadingBar.complete();
            $scope.login.error = data;
        });
    };

    $scope.logout = function logout() {
        console.log('Logging out');
        $scope.user = undefined;
        $cookieStore.remove('user');
        $location.path('/login');
    };

    $scope.signup = function(){
        console.log('Signing up user');

        if(!validateEmail($scope.signup.email)){
            $scope.signup.error = 'Please enter a valid email.';
        }else if($scope.signup.password !== undefined){
            $scope.signup.error = 'Pltease enter a password.';
        }else if ($scope.signup.password !== $scope.signup.confirm){
            $scope.signup.error = 'Passwords do not match.';
        }else{
            cfpLoadingBar.start();

            $http({
                method: 'post',
                url: '/users',
                data: {email: $scope.signup.email, password: $scope.signup.password}
            }).success(function (data, status, headers, config) {
                $scope.user = $scope.login.email;
                $cookieStore.put('user', data);
                cfpLoadingBar.complete();
                $scope.signup = undefined;
                $window.location.href = '#/news';
            }).error(function (data, status, headers, config) {
                cfpLoadingBar.complete();
                $scope.signup.error = data;
            });
        }

    };

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}]);
