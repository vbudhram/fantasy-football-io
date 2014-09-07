/**
 * Angular service to manage a user.
 *
 * Created by vbudhram on 9/6/14.
 */
'use strict';

app.service('UserService', ['$http', '$q', '$rootScope', '$location', function ($http, $q, $rootScope, $location) {

    var loggedIn = false;

    var user;

    this.logIn = function(email, password){

    };

    this.logOut = function(){

    };

}]);