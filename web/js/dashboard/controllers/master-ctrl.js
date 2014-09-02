/**
 * Master Controller
 */

'use strict';
app.controller('MasterCtrl', ['$scope', '$http', '$rootScope', 'cfpLoadingBar','$location', '$cookieStore', function ($scope, $http, $rootScope, cfpLoadingBar, $location, $cookieStore){
    /**
     * Sidebar Toggle & Cookie Control
     *
     */
    var mobileView = 992;

    $scope.getWidth = function() { return window.innerWidth; };

    $scope.$watch($scope.getWidth, function(newValue, oldValue)
    {
        if(newValue >= mobileView)
        {
            if(angular.isDefined($cookieStore.get('toggle')))
            {
                if($cookieStore.get('toggle') == false)
                {
                    $scope.toggle = false;
                }
                else
                {
                    $scope.toggle = true;
                }
            }
            else
            {
                $scope.toggle = true;
            }
        }
        else
        {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function()
    {
        $scope.toggle = ! $scope.toggle;

        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() { $scope.$apply(); };

    $scope.user = $cookieStore.get('user');

    $scope.login = function login() {
        cfpLoadingBar.start();
        console.log('Logging in');
        $scope.login.error = '';
        $http({
            method: 'post',
            url: '/doLogin',
            data: {email: $scope.login.email, password: $scope.login.password}
        }).success(function (data, status, headers, config) {
            console.log(data);

            $scope.user = data;

            $cookieStore.put('user', data);

            cfpLoadingBar.complete();

            $location.path('/news');
        }).error(function (data, status, headers, config) {
            console.log(data);
            cfpLoadingBar.complete();
            $scope.login.error = data;
        });
    };

    $scope.logout = function logout() {
        console.log('Logging out');
        $scope.user = undefined;
        $location.path('/login');
    };
}]);
