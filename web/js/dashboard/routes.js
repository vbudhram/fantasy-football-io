'use strict';

/**
 * Route configuration for the Dashboard module.
 */
angular.module('Dashboard').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

    // For unmatched routes
    $urlRouterProvider.otherwise('/');

    // Application routes
    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'views/articles.html'
        })
        .state('news', {
            url: '/',
            templateUrl: 'views/articles.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'MasterCtrl'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: 'views/signup.html'
        });
}]);
