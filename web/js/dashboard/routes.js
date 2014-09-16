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
        .state('playerMatrix', {
            url: '/playerMatrix',
            templateUrl: 'views/playerMatrix.html',
            controller: 'PlayerMatrixCtrl'
        })

        .state('sites', {
            url: '/sites',
            templateUrl: 'views/teams.html',
            controller: 'SiteCtrl'
        })
        .state('scoreboards', {
            url: '/scoreboards',
            templateUrl: 'views/scoreboards.html',
            controller: 'ScoreboardCtrl'
        })
        .state('account', {
            url: '/account',
            templateUrl: 'views/account.html',
            controller: 'AccountCtrl'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: 'views/signup.html'
        });
}]);
