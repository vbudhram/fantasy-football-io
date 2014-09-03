/**
 * Created by vbudhram on 9/2/14.
 */
app.controller('SiteCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.loading = true;

    $http({method: 'get', url: '/espn/football'}).
        success(function (data, status) {
            $scope.teams = data;
            $scope.loading = false;
        }).
        error(function (data, status) {
            $scope.loading = false;
        });
}]);