/**
 * Created by vbudhram on 9/15/14.
 */
app.controller('PlayerMatrixCtrl', ['$scope', '$http', 'UserService', function ($scope, $http, UserService) {

    $scope.init = function(){
        $http({method: 'get', url: '/users'}).
            success(function (data, status) {
                setupTable(data);
            }).
            error(function (data, status) {
                console.log(data);
            });
    };

    // Format players
    function setupTable(user){
        var players = {};

        user.sites.forEach(function(site){
            site.sports.forEach(function(sport){
                sport.teams.forEach(function(team){

                    if(team.active){
                        team.players.forEach(function(player){
                            if(players[player.playerName] === undefined){
                                players[player.playerName] = {
                                    playerInfo: player,
                                    playerTeam: [team]
                                };
                            }else{
                                delete team.players;
                                players[player.playerName].playerTeam.push(team);
                            }
                        });

//                        delete team.players;
                    }
                });
            });
        });

        $scope.players = players;
    }
}]);