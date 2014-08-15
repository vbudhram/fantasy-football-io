/**
 * Created by vbudhram on 8/14/14.
 */
var app = angular.module('Dashboard');

app.controller('NewsCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.loading = true;

    $http({method: 'get', url: '/news'}).
        success(function (data, status) {
            $scope.articles = data;
            $scope.loading = false;
        }).
        error(function (data, status) {
            $scope.articles = [];
            $scope.loading = false;
        });

    $scope.alerts = [
        { type: 'success', msg: 'Thanks for visiting! Feel free to create pull requests to improve the dashboard!' },
        { type: 'danger', msg: 'Found a bug? Create an issue with as many details as you can.' }
    ];
}]);