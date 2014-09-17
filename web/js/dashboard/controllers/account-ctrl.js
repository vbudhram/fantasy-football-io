/**
 * Created by vbudhram on 9/4/14.
 */
'use strict';

app.controller('AccountCtrl', ['$scope', '$http', '$modal', '$log', 'SiteService', function ($scope, $http, $modal, $log, SiteService) {

    $scope.init = function(){
        $http({method: 'get', url: '/users'}).
            success(function (data, status) {
                $scope.user = data;
                updateTotalTeams();
            }).
            error(function (data, status) {
                console.log(data);
            });
    };

    $scope.addSite = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addSiteModal.html',
            controller: ModalInstanceCtrl
        });

        modalInstance.result.then(function (site) {
            $scope.user.sites.splice(0, 0, site);
            updateTotalTeams();
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.removeSite = function (index) {
        SiteService.removeSite($scope.user.sites[index]).then(function (result) {
            $scope.user.sites.splice(index, 1);
            updateTotalTeams();
        }, function (err) {
            $log.error(err);
        });
    };

    $scope.getImageSrc = function (name) {
        return SiteService.getSiteImage(name);
    };

    function updateTotalTeams(){
        var count = 0;
        $scope.user.sites.forEach(function(site){
            site.sports.forEach(function(sport){
                count = sport.teams.length + count;
            });
        });
        $scope.totalTeams = count;
    }
}]);

var ModalInstanceCtrl = function ($scope, $http, $modalInstance, SiteService) {
    $scope.loading = false;

    $scope.siteOptions = SiteService.getSiteOptions();

    $scope.ok = function () {
        if (this.addSiteForm.$valid && this.selectedSite) {
            $scope.loading = true;
            SiteService.addSite(this.selectedSite.name, this.site.email, this.site.password).then(function (value) {
                $scope.loading = false;
                $modalInstance.close(value);
            }, function (error) {
                $scope.loading = false;
                $scope.error = error.error;
            });
        } else {
            $scope.error = 'Please enter all values.';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.getImageSrc = function (name) {
        return SiteService.getSiteImage(name);
    };

    $scope.selectSite = function (site) {
        console.log('Selected site ' + site.name);
        $scope.selectedSite = site;
    };
};