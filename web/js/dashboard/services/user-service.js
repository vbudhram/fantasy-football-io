/**
 * Angular service to manage a user.
 *
 * Created by vbudhram on 9/6/14.
 */
'use strict';

app.service('UserService', ['$http', '$q', '$location', '$cookieStore', 'md5', function ($http, $q, $location, $cookieStore, md5) {

    this.getCurrentUser = function () {
        return $cookieStore.get('user');
    };

    function setCurrentUser(newUser){
        var avatarUrl = newUser ? ('http://www.gravatar.com/avatar/' + md5.createHash(newUser.email)) : 'img/avatar.jpg';
        newUser.avatarUrl = avatarUrl;
        $cookieStore.put('user', newUser);
    }

    this.login = function (email, password) {
        console.log('Logging in with ' + email);
        var deferred = $q.defer();

        $http({
            method: 'post',
            url: '/doLogin',
            data: {email: email, password: password}
        }).success(function (data, status, headers, config) {
            setCurrentUser(data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            deferred.reject(data);
        });

        return deferred.promise;
    };

    this.logout = function () {
        console.log('Logging out');
        var deferred = $q.defer();

        $http({
            method: 'post',
            url: '/logout'
        }).success(function (data, status, headers, config) {
            $cookieStore.remove('user');
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            deferred.reject(data);
        });

        return deferred.promise;
    };

}]);