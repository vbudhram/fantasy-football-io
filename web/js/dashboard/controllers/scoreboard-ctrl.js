/**
 * Created by vbudhram on 9/8/14.
 */
app.controller('ScoreboardCtrl', ['$scope', '$http', 'ScoreboardService', 'md5', 'SiteService', 'UserService', function ($scope, $http, ScoreboardService, md5, SiteService, UserService) {

    $scope.isFiltered = false;
    $scope.loading = false;
    $scope.sockets = [];

    function applyHighlights(oldScoreboard, newScoreboard) {
        for (var i = 0; i < newScoreboard.games.length; i++) {
            var newGame = newScoreboard.games[i];
            var oldGame = oldScoreboard.games[i];

            var newAwayTeam = newGame.awayTeam[0];
            var oldAwayTeam = oldGame.awayTeam[0];
            if (newAwayTeam.score > oldAwayTeam.score) {
                newAwayTeam.scoreState = 'increase';
            } else if (newAwayTeam.score < oldAwayTeam.score) {
                newAwayTeam.scoreState = 'decrease';

            } else {
                newAwayTeam.scoreState = 'normal';
            }

            var newHomeTeam = newGame.homeTeam[0];
            var oldHomeTeam = oldGame.homeTeam[0];
            if (newHomeTeam.score > oldHomeTeam.score) {
                newHomeTeam.scoreState = 'increase';
            } else if (newHomeTeam.score > oldHomeTeam.score) {
                newHomeTeam.scoreState = 'decrease';
            } else {
                newHomeTeam.scoreState = 'normal';
            }
        }

        $scope.$apply();
    }

    function applyFilterData() {
        $scope.scoreboards.forEach(function (scoreboard) {
            scoreboard.games.forEach(function (game) {
                var homeTeam = game.homeTeam[0];
                var awayTeam = game.awayTeam[0];
                if (!$scope.teams || containsTeam(homeTeam.name) || containsTeam(awayTeam.name)) {
                    game.visible = true;
                }else{
                    game.visible = false;
                }
            });
        });
    }

    function containsTeam(name) {
        for (var i = 0; i < $scope.teams.length; i++) {
            var team = $scope.teams[i];
            if (name === team.name) {
                return true;
            }
        }
        return false;
    }

    function registerSocket(scoreboards) {
        scoreboards.forEach(function (scoreboard) {
            var roomName = md5.createHash(scoreboard.url);
            var socket = io('/' + roomName);

            socket.on('connection', function (data) {
                console.log('client connected!');
            });

            socket.on('scoreboardUpdate', function (data) {
                for (var i = 0; i < $scope.scoreboards.length; i++) {
                    var scoreboard = $scope.scoreboards[i];
                    if (scoreboard.url === data.url) {
                        var oldScoreboard = $scope.scoreboards[i];
                        $scope.scoreboards[i] = data;
                        applyFilterData();
                        applyHighlights(oldScoreboard, data);
                    }
                }

                // Remove hightlights after 1.5 seconds
                setTimeout(function () {
                    console.log('Removing highlights');
                    for (var i = 0; i < $scope.scoreboards.length; i++) {
                        var scoreboard = $scope.scoreboards[i];
                        for (var j = 0; j < scoreboard.games.length; j++) {
                            var newGame = scoreboard.games[j];
                            var newAwayTeam = newGame.awayTeam[0];
                            var newHomeTeam = newGame.homeTeam[0];
                            newAwayTeam.scoreState = 'normal';
                            newHomeTeam.scoreState = 'normal';
                        }
                    }
                    $scope.$apply();
                }, 1500);

            });

            $scope.sockets.push(socket);
        });
    }

    $scope.getScoreboards = function () {
        console.log('Getting scoreboards');
        $scope.loading = true;
        ScoreboardService.getScoreboards().then(function (result) {
            $scope.loading = false;
            $scope.scoreboards = result;
            registerSocket(result);
            applyFilterData();
        }, function (err) {
            $scope.loading = false;
            $scope.error = err;
        });
    };

    $scope.getImageSrc = function (scoreboard) {
        return SiteService.getSiteImage(scoreboard.site);
    };

    $scope.filterMyTeams = function () {

        if(!$scope.isFiltered){
            console.log('Filtering only for user\'s team');
            UserService.getLatestUser().then(function (data) {
                $scope.teams = [];
                data.sites.forEach(function (site) {
                    $scope.teams = $scope.teams.concat(site.sports[0].teams);
                });
                applyFilterData();
            }, function (err) {
                console.log(err);
            });
        }else{
            $scope.teams = undefined;
            applyFilterData();
        }
    };
}]);