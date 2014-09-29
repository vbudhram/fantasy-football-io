/**
 * Created by vbudhram on 9/2/14.
 */
'use strict';

app.controller('SiteCtrl', ['$scope', '$http', 'SiteService', 'UserService', function ($scope, $http, SiteService, UserService) {

    $scope.loading = true;
    $scope.teams = [];

    $scope.init = function () {
        $scope.teams = [];
        $scope.loading = true;

        UserService.getLatestUser().then(function (data) {
            data.sites.forEach(function (site) {
                $scope.teams = $scope.teams.concat(site.sports[0].teams);
            });
            $scope.loading = false;
        }, function (err) {
            console.log(err);
            $scope.loading = false;
        });
    };

    $scope.getImageSrc = function (teamUrl) {
        return SiteService.getSiteImage(teamUrl);
    };
}]);