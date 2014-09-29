/**
 * Created by vbudhram on 9/13/14.
 */
'use strict';

module.exports = function (socketio) {

    var q = require('q');
    var espnUtils = require('../utils/espnUtils');
    var yahooUtils = require('../utils/yahooUtils');
    var crypto = require('crypto');

    var scoreboards = {};

    function processBoards() {
        var keys = Object.keys(scoreboards);

        console.log('Processing scoreboards ' + keys.length);

        var doneQ = q.defer();

        var defers = [];

        keys.forEach(function (key) {
            var defer = q.defer();
            defers.push(defer.promise);

            var scoreboard = scoreboards[key];
            var site = scoreboard.site;
            var encryptionUtils = scoreboard.encryptionUtils;
            var room = scoreboard.room;

            if (room.sockets.length > 0) {
                if (scoreboard.url.indexOf('espn') > -1) {
                    espnUtils.login(encryptionUtils.decrypt(site.username), encryptionUtils.decrypt(site.password)).then(function (data) {
                        espnUtils.getScoreboard(scoreboard.url, data.cookieJar).then(function (newScoreboard) {
                            console.log('Emitting scoreboard, ' + scoreboard.url + ', to ' + room.sockets.length);
                            room.emit('scoreboardUpdate', newScoreboard);
                            defer.resolve();
                        }, function (err) {
                            // If error processing board, close socket and remove from keys
                            console.log('Error processing scoreboard : ' + site.url);
                            defer.reject(err);
                            delete scoreboards[key];
                        });
                    }, function (err) {
                        console.log('Error processing scoreboard : ' + site.url);
                        defer.reject();
                        delete scoreboards[key];
                    });
                } else if (scoreboard.url.indexOf('yahoo') > -1) {
                    yahooUtils.login(encryptionUtils.decrypt(site.username), encryptionUtils.decrypt(site.password)).then(function (data) {
                        yahooUtils.getScoreboard(scoreboard.url, data.cookieJar).then(function (newScoreboard) {
                            console.log('Emitting scoreboard, ' + scoreboard.url + ', to ' + room.sockets.length);
                            room.emit('scoreboardUpdate', newScoreboard);
                            defer.resolve();
                        }, function (err) {
                            // If error processing board, close socket and remove from keys
                            console.log('Error processing scoreboard : ' + site.url);
                            defer.reject();
                            delete scoreboards[key];
                        });
                    }, function (err) {
                        console.log('Error processing scoreboard : ' + site.url);
                        defer.reject();
                        delete scoreboards[key];
                    });
                }

            } else {
                console.log('No client in room removing it : ' + key);
                delete scoreboards[key];
            }

        });

//        setTimeout(function () {
//            defer.resolve('done');
//        }, 5000);

        q.allSettled(defers).done(function(result){
            doneQ.resolve();
        });

        return doneQ.promise;
    }

    function registerBoard(data) {
        // Only register ESPN urls for now
        var user = data.user;
        var encryptionUtils = data.encryptionUtils;
        //var scoreboards = data.scoreboards;

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