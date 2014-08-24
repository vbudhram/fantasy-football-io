angular.module('Dashboard', ['ui.bootstrap', 'ui.router', 'ngCookies', 'angulartics', 'angulartics.google.analytics'])
    .config(function ($analyticsProvider) {
        $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
        $analyticsProvider.withAutoBase(true);  /* Records full path */
    });