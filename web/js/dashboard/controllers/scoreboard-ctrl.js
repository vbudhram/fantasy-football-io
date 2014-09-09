/**
 * Created by vbudhram on 9/8/14.
 */
app.controller('ScoreboardCtrl', ['$scope', '$http', 'ScoreboardService', function ($scope, $http, ScoreboardService) {

    $scope.loading = false;

    $scope.getScoreboards = function () {
        console.log('Getting scoreboards');
        $scope.loading = true;
        ScoreboardService.getScoreboards('espn','football').then(function (result) {
            $scope.loading = false;
            $scope.scoreboards = result;
        }, function (err) {
            $scope.loading = false;
            $scope.error = err;
        });
    };
}]);