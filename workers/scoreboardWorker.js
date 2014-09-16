/**
 * Created by vbudhram on 9/13/14.
 */
'use strict';

module.exports = function (socketio) {

    var q = require('q');
    var ESPNUtils = require('../utils/espnUtils');
    var crypto = require('crypto');

    var scoreboards = {};

    function processBoards() {
        var defer = q.defer();

        var keys = Object.keys(scoreboards);

        console.log('Processing scoreboards ' + keys.length);

        keys.forEach(function (key) {

            var scoreboard = scoreboards[key];
            var site = scoreboard.site;
            var encryptionUtils = scoreboard.encryptionUtils;
            var room = scoreboard.room;

            if(room.sockets.length > 0){
                ESPNUtils.login(encryptionUtils.decrypt(site.username), encryptionUtils.decrypt(site.password)).then(function (data) {
                    ESPNUtils.getScoreboard(scoreboard.url, data.cookieJar).then(function (newScoreboard) {
//                    newScoreboard.games[3].awayTeam[0].score = parseFloat(newScoreboard.games[0].awayTeam[0].score) + Math.abs(Math.random() * 100);
//                    newScoreboard.games[4].awayTeam[0].score = parseFloat(newScoreboard.games[0].awayTeam[0].score) - Math.abs(Math.random() * 100);

                        console.log('Emitting scoreboard, ' + scoreboard.url + ', to ' + room.sockets.length);
                        room.emit('scoreboardUpdate', newScoreboard);
                    }, function (err) {
                        // If error processing board, close socket and remove from keys
                        console.log('Error processing scoreboard : ' + site.url);
                        delete scoreboards[key];
                    });
                }, function (err) {
                    console.log('Error processing scoreboard : ' + site.url);
                    delete scoreboards[key];
                });
            }else{
                console.log('No client in room removing it : ' + key);
                delete scoreboards[key];
            }

        });

        setTimeout(function () {
            defer.resolve('done');
        }, 5000);

        return defer.promise;
    }

    function registerBoard(data) {
        // Only register ESPN urls for now
        var user = data.user;
        var encryptionUtils = data.encryptionUtils;

        user.sites.forEach(function (site) {
            site.sports[0].teams.forEach(function (team) {
                var scoreboardUrl = team.leagueScoreboardUrl;
                if (scoreboards[scoreboardUrl] === undefined) {

                    var roomName = crypto.createHash('md5').update(scoreboardUrl).digest('hex');

                    var room = socketio.of('/' + roomName);
                    room.on('connection', function (socket) {
                        var clientName =
                        console.log('New connection to room ' + scoreboardUrl);
                    });

                    console.log('Creating socket room for scoreboard url : ' + scoreboardUrl);

                    scoreboards[scoreboardUrl] = {
                        encryptionUtils: encryptionUtils,
                        site: site,
                        url: scoreboardUrl,
                        room: room
                    };
                }
            });
        });
    }

    return {
        registerBoard: registerBoard,
        processBoards: processBoards
    };
};