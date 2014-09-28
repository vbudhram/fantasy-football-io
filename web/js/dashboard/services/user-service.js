/**
 * Angular service to manage a user.
 *
 * Created by vbudhram on 9/6/14.
 */
'use strict';

app.service('UserService', ['$http', '$q', '$location', '$cookieStore', 'md5', '$rootScope', function ($http, $q, $location, $cookieStore, md5, $rootScope) {

    this.getLatestUser = function(){
        var deferred = $q.defer();

        $http({method: 'get', url: '/users'}).
            success(function (data, status) {
                deferred.resolve(data);
            }).
            error(function (data, status) {
                console.log(data);
                deferred.reject(data);
            });

        return deferred.promise;
    };

    this.getCurrentUser = function () {
        console.log('Getting current user');
        return $cookieStore.get('user');
    };

    function setCurrentUser(newUser) {
        var avatarUrl = newUser ? ('http://www.gravatar.com/avatar/' + md5.createHash(newUser.email)) : 'img/avatar.jpg';
        newUser.avatarUrl = avatarUrl;
        $cookieStore.put('user', newUser);
    }

    function login(email, password){
        console.log('Logging in with ' + email);
        var deferred = $q.defer();

        $http({
            method: 'post',
            url: '/doLogin',
            data: {email: email, password: password}
        }).success(function (data, status, headers, config) {
            setCurrentUser(data);
            $rootScope.$broadcast('login', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            deferred.reject(data);
        });

        return deferred.promise;
    }

    this.login = function (email, password) {
        return login(email, password);
    };

    this.logout = function () {
        console.log('Logging out');
        var deferred = $q.defer();

        $http({
            method: 'post',
            url: '/logout'
        }).success(function (data, status, headers, config) {
            $cookieStore.remove('user');
            $rootScope.$broadcast('logout', data);
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            deferred.reject(data);
        });

        return deferred.promise;
    };

    this.signup = function (email, password) {
        console.log('Signing up user');
        var deferred = $q.defer();

        $http({
            method: 'post',
            url: '/users',
            data: {email: email, password: password}
        }).success(function (data, status, headers, config) {

            login(email, password).then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });

        }).error(function (data, status, headers, config) {
            deferred.reject(data);
        });

        return deferred.promise;
    };
}]);