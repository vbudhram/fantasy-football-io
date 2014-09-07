/**
 * Angular service to manage a user's sites.
 *
 * Created by vbudhram on 9/6/14.
 */
app.service('SiteService', function ($http, $q) {

    this.getSiteOptions = function () {
        return [
            {name: 'espn'}
        ];
    };

    /**
     * Returns the site information.
     * @param siteName
     * @returns {*}
     */
    this.getSite = function (siteName) {
        var deferred = $q.defer();

        $http({
            method: 'get',
            url: '/' + siteName
        }).success(function (data, status) {
            deferred.resolve(data);
        }).error(function (data, status) {
            deferred.reject(data);
        });

        return deferred.promise;
    };

    /**
     * Adds a new site to the logged in user.
     * @param siteName
     * @param username
     * @param password
     * @returns {*}
     */
    this.addSite = function (siteName, username, password) {
        console.log('Adding new site, ' + siteName + ', to user ' + username);
        var deferred = $q.defer();
        $http({
            method: 'post',
            url: '/' + siteName,
            data: {username: username, password: password}
        }).success(function (data, status) {
            deferred.resolve(data);
        }).error(function (data, status) {
            deferred.reject(data);
        });

        return deferred.promise;
    };

    /**
     * Returns all teams for all site and sport combination.
     * @param site
     * @param sport
     * @returns {*}
     */
    this.getTeams = function (site, sport) {
        var deferred = $q.defer();

        $http({method: 'get', url: '/' + site + '/' + sport}).
            success(function (data, status) {
                deferred.resolve(data);
            }).
            error(function (data, status) {
                deferred.reject(data);
            });

        return deferred.promise;
    };
});