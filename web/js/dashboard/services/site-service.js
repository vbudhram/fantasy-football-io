/**
 * Angular service to manage a user's sites.
 *
 * Created by vbudhram on 9/6/14.
 */
app.service('SiteService', function ($http, $q) {

    this.getSiteOptions = function () {
        return [
            {name: 'espn'},
            {name: 'yahoo'}
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
     * Removes a site from a user.
     * @param site
     * @returns {*}
     */
    this.removeSite = function (site) {
        // TODO, find out how to get a unique id for the site, not to happy about removing based on user index.
        console.log('Removing site ' + site + ', id: ' + site._id);
        var deferred = $q.defer();
        $http.delete('/' + site.name + '/' + site._id)
            .success(function (data, status) {
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

    /**
     * Returns the image url for the site
     * @param siteName
     * @returns {string}
     */
    this.getSiteImage = function (siteName) {
        if(siteName.indexOf('espn') > -1){
            return 'https://lh4.googleusercontent.com/-yOoKXdob9y8/AAAAAAAAAAI/AAAAAAACB5c/Dd157Do4vBs/s120-c/photo.jpg';
        }else if(siteName.indexOf('yahoo') > -1){
            return 'https://lh3.googleusercontent.com/-REC9hG2lrlY/AAAAAAAAAAI/AAAAAAAAFaw/d9En7QdXlTA/s120-c/photo.jpg';
        }else{
            return '';
        }
    };
});