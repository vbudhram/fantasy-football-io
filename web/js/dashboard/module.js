var app = angular.module('Dashboard', ['ui.bootstrap', 'ui.router', 'ngCookies', 'angulartics', 'angulartics.google.analytics', 'chieffancypants.loadingBar', 'ngAnimate', 'angular-md5'])
    .config(function ($analyticsProvider) {
        $analyticsProvider.firstPageview(true);
        /* Records pages that don't use $state or $route */
        $analyticsProvider.withAutoBase(true);
        /* Records full path */
    })
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = true;
    }])
    .config(function ($provide, $httpProvider) {

        // Intercept http calls.
        $provide.factory('HttpInterceptor', function ($q, $location) {
            return {
                // On response failure
                responseError: function (rejection) {
//                    console.log(rejection); // Contains the data about the error.

                    switch(rejection.status){
                        case 403:
                        {
                            $location.path('/login');
                        }
                    }

                    // Return the promise rejection.
                    return $q.reject(rejection);
                }
            };
        });

        // Add the interceptor to the $httpProvider.
        $httpProvider.interceptors.push('HttpInterceptor');

    });