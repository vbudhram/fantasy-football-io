/**
 * Created by vbudhram on 9/8/14.
 */
'use strict';
app.service('ScoreboardService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    this.getScoreboards = function(site, sport){
        var deferred = $q.defer();

        $http({method: 'post', url: '/scoreboard/' + site + '/' + sport}).
            success(function (data, status) {
                deferred.resolve(data.scoreboards);
            }).
            error(function (data, status) {
                deferred.reject(data);
            });

        return deferred.promise;
    };

}]);