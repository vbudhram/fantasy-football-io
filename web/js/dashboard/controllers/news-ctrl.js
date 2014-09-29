/**
 * Created by vbudhram on 8/14/14.
 */
app.controller('NewsCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.loading = true;

    $http({method: 'get', url: '/news'}).
        success(function (data, status) {
            $scope.articles = data;
            $scope.loading = false;
        }).
        error(function (data, status) {
            $scope.articles = [];
            $scope.loading = false;
        });

    $scope.getImageSrc = function (article) {
        switch (article.source) {
            case 'ESPN Football':
            {
                return 'https://lh4.googleusercontent.com/-yOoKXdob9y8/AAAAAAAAAAI/AAAAAAACB5c/Dd157Do4vBs/s120-c/photo.jpg';
            }
            case 'Yahoo Football':
            {
                return 'https://lh3.googleusercontent.com/-REC9hG2lrlY/AAAAAAAAAAI/AAAAAAAAFaw/d9En7QdXlTA/s120-c/photo.jpg';
            }
            case 'Rotoworld Football':
            {
                return 'https://lh3.googleusercontent.com/-TDqduPW0yDU/AAAAAAAAAAI/AAAAAAAAACE/hqiP8xPLdVg/s120-c/photo.jpg';
            }
            case 'CBS Sports Football':
            {
                return 'https://lh4.googleusercontent.com/-4NvKeBokrtE/AAAAAAAAAAI/AAAAAAABIwI/6HLa29Ztp1Y/s120-c/photo.jpg';
            }
            case 'USA Today Football':
            {
                return 'https://lh5.googleusercontent.com/-ZaYfYmjUUjA/AAAAAAAAAAI/AAAAAAAAIQs/Ydunp8tRLrg/s120-c/photo.jpg';
            }
        }
    };

    $scope.getMediaImageSrc = function(article){
        return article.mediaUrl;
    };

}]);