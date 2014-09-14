/**
 * Created by vbudhram on 9/8/14.
 */
app.controller('ScoreboardCtrl', ['$scope', '$http', 'ScoreboardService', 'md5', function ($scope, $http, ScoreboardService, md5) {

    $scope.loading = false;
    $scope.sockets = [];

    function registerSocket(scoreboards) {
        scoreboards.forEach(function (scoreboard) {
            var roomName = md5.createHash(scoreboard.url);
            var socket = io('/' + roomName);

            socket.on('connection', function(data){
               console.log('client connected!');
            });

            socket.on('scoreboardUpdate', function(data){
                console.log('Scoreboard room : ' + data.url);
                for(var i =0;i<$scope.scoreboards.length;i++){
                    var scoreboard = $scope.scoreboards[i];
                    if(scoreboard.url === data.url){
                        $scope.scoreboards[i] = data;
                        $scope.$apply();
                        return;
                    }
                }
            });

            $scope.sockets.push(socket);
        });
    }

    $scope.getScoreboards = function () {
        console.log('Getting scoreboards');
        $scope.loading = true;
        ScoreboardService.getScoreboards('espn', 'football').then(function (result) {
            $scope.loading = false;
            $scope.scoreboards = result;
            registerSocket(result);
        }, function (err) {
            $scope.loading = false;
            $scope.error = err;
        });
    };
}]);