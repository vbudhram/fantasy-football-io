/**
 * Created by vbudhram on 9/2/14.
 */
'use strict';

app.controller('SiteCtrl', ['$scope', '$http', 'SiteService', function ($scope, $http, SiteService) {

    $scope.loading = true;
    $scope.teams = [];

    SiteService.getTeams('espn','football').then(function(result){
        $scope.loading = false;
        $scope.teams = result.teams;
    }, function(err){
        console.log('Failed to get teams' + err);
        $scope.loading = false;
        $scope.teams = [];
    });
}]);