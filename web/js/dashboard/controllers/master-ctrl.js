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
        $scope.user = UserService.getCurrentUser();
    };

    $scope.$on('login', function(event, args){
        $scope.user = args;
    });

    $scope.$on('logout', function(event, args){
       $scope.user = undefined;
    });

    $scope.$on("$locationChangeStart", function(event, next, current) {
        console.log("location changing to:" + next);
        var title = 'Fantasy Ally';

        if(next.indexOf('/scoreboards') > -1){
            title = 'Live Scoreboard';
        }else if(next.indexOf('/sites') > -1){
            title = 'Teams';
        }else if(next.indexOf('/account') > -1){
            title = 'Account';
        }

        $scope.title = title;
    });

    $scope.logout = function logout() {
        UserService.logout().then(function (data) {
            $rootScope.$broadcast('logout', data);
            $location.path('/login');
        }, function (err) {
            $location.path('/login');
        });
    };
}]);
