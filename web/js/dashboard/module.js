var app = angular.module('Dashboard', ['ui.bootstrap', 'ui.router', 'ngCookies', 'angulartics', 'angulartics.google.analytics', 'chieffancypants.loadingBar', 'ngAnimate', 'angular-md5'])
    .config(function ($analyticsProvider) {
        $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
        $analyticsProvider.withAutoBase(true);  /* Records full path */
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
    }]);