/**
 * Created by vbudhram on 9/8/14.
 */
'use strict';
app.service('ScoreboardService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    this.getScoreboards = function(){
        var deferred = $q.defer();

        $http({method: 'get', url: '/scoreboards'}).
            success(function (data, status) {
                deferred.resolve(data.scoreboards);
            }).
            error(function (data, status) {
                deferred.reject(data);
            });

        return deferred.promise;
    };

}]);