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

        modalInstance.result.then(function () {
            $log.info('Modal stuff happend');
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
}]);

var ModalInstanceCtrl = function ($scope, $http, $modalInstance) {
    $scope.loading = false;
    $scope.ok = function () {
        if($scope.site.name){
            $scope.site.error = 'Please select a site.';
        }else{
            $http({
                method: 'post',
                url: '/' + $scope.site.name
            }).success(function (data, status) {
                $scope.user = data;
                $modalInstance.close();
            }).error(function (data, status) {
                console.log(data);
                $scope.site.error = data;
            });
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};