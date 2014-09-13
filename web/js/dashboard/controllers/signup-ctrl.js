/**
 * Created by vbudhram on 9/13/14.
 */
app.controller('SignupCtrl', ['$scope', '$location', 'UserService', '$rootScope', function ($scope, $location, UserService, $rootScope) {

    $scope.signup = function () {
        if (!validateEmail($scope.email)) {
            $scope.error = 'Please enter a valid email address.';
        }else{
            UserService.signup($scope.email, $scope.password).then(function (data) {
                $location.path('/news');
            }, function (err) {
                $scope.error = err;
            });
        }
    };

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}]);