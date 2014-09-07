/**
 * Created by vbudhram on 9/4/14.
 */
'use strict';

app.controller('AccountCtrl', ['$scope', '$http', '$modal', '$log', function ($scope, $http, $modal, $log) {

    $http({method: 'get', url: '/users'}).
        success(function (data, status) {
            $scope.user = data;
        }).
        error(function (data, status) {
            console.log(data);
        });

    $scope.addSite = function () {
        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: ModalInstanceCtrl
        });

        modalInstance.result.then(function (site) {
            $log.info('Modal stuff happened');
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
}]);

var ModalInstanceCtrl = function ($scope, $http, $modalInstance, SiteService) {
    $scope.loading = false;

    $scope.siteOptions = SiteService.getSiteOptions();

    $scope.ok = function () {
        if(this.addSiteForm.$valid){
            $scope.loading = true;
            SiteService.addSite(this.site.name.name, this.site.email, this.site.password).then(function(value){
                $scope.loading = false;
                $modalInstance.close(value);
            }, function(error){
                $scope.loading = false;
                $scope.error = error.error;
            });
        }else{
            $scope.error = 'Please enter all values.';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};