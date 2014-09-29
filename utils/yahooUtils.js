/**
 * Functions that scrape fantasy football information from the espn team website.
 *
 * Created by vijay.budhram on 7/11/14.
 */
(function () {
    'use strict';

    var q = require('q');
    var cheerio = require('cheerio');
    var request = require('request');
    var Browser = require('zombie');
    var LOGIN_URL = 'https://login.yahoo.com/config/login;_ylt=Avm0ErGcbRvZMnLYWCt8.H63cJ8u?.src=fantasy&.intl=us&.lang=en-US&.done=http://football.fantasysports.yahoo.com/';
    var FRONTPAGE_URL = 'http://football.fantasysports.yahoo.com/';

    function login(username, password) {
        console.log('Logging into Yahoo with username/password = ' + username + '/*****');

        var defer = q.defer();

        var request = require('request');
        var cheerio = require('cheerio');
        var cookieJar = request.jar();

        var options = {
            url: 'https://login.yahoo.com/config/login',
            method: 'POST',
            jar: cookieJar,
            followAllRedirects: true,
            headers: {
                "Host": "login.yahoo.com",
                "Connection": "keep-alive",
                "Origin": "https://login.yahoo.com",
                "X-Requested-With": "XMLHttpRequest",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.122 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "Referer": "https://login.yahoo.com/config/login?.src=fantasy&.intl=us&.lang=en-US&.done=http://football.fantasysports.yahoo.com/"
            },
            form: {
                ".src": "fantasy",
                ".lang": "en-US",
                ".done": "http://football.fantasysports.yahoo.com/",
                "login": username,
                "passwd": password

            }
        };

        request(options, function (err, res, body) {
            var options = {
                url: 'http://football.fantasysports.yahoo.com/',
                method: 'POST',
                jar: cookieJar,
                followAllRedirects: true,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.122 Safari/537.36"
                }
            };
            request(options, function (err, res, body) {
                var data = {
                    body: body,
                    cookieJar: cookieJar
                };
                defer.resolve(data);
            });
        });

        return defer.promise;
    }

    function getTeam(teamUrl, cookieJar) {
        var getTeamQ = q.defer();

        console.log('Getting team for link = ' + teamUrl);

        var request = require('request');
        var cheerio = require('cheerio');

        // Get team page and extract name, record, and players
        var teamPageOptions = {
            url: teamUrl,
            method: 'GET',
            jar: cookieJar,
            followAllRedirects: true
        };
        request(teamPageOptions, function (err, res, body) {
            if (err) {
                getTeamQ.reject(err);
            } else {
                var $ = cheerio.load(body);

                var players = [];
                var playerCells = $('.Nowrap').filter('.name');
                for (var i = 0; i < playerCells.length; i++) {
                    try {
                        var cell = playerCells[i];
                        var playerName = cell.children[0].data;
                        var playerTokens = cell.next.next.children[0].data.replace(' ', '').split('-');
                        var playerTeamName = playerTokens[0];
                        var position = $('span').filter('.pos-label')[i].children[0].data;
                        var opponent = $('span').filter('.ysf-game-status')[i].children[0].next.data;
                        var projectedPoints = $('tbody')[1].children[i].children[4].children[0].children[0].data;

                        var player = {
                            position: position,
                            playerName: playerName,
                            playerTeamName: playerTeamName,
                            opponent: opponent,
                            projectedPoints: projectedPoints
                        };

                        players.push(player);

                    } catch (e) {
                        console.log('Failed to parse player at index: ' + i);
                    }
                }

                // Get team name
                var teamName = $('a').filter('.Wordwrap-bw')[0].children[0].data.trim();
                var record = $('li').filter('.Mend-xl').filter('.Pstart-lg')[0].children[1].children[0].data;
                var rank = $('em').filter('.Fz-xxs')[0].children[0].data;// + $('em').filter('.Fz-xxs')[0].children[1].children[0].data;
                var teamImageUrl = $('img').filter('.Avatar-lg')[0].attribs.src;
                var leagueName = $('span').filter('.Mbot-xs')[0].children[1].data;
                var scoreboardUrl = teamUrl.substring(0, teamUrl.lastIndexOf('/'));

                var team = {
                    active: true,
                    name: teamName,
                    record: record,
                    rank: rank,
                    teamUrl: teamUrl,
                    teamImageUrl: teamImageUrl,
                    leagueName: leagueName,
                    leagueScoreboardUrl: scoreboardUrl,
                    players: players
                };

                getTeamQ.resolve(team);
            }
        });

        return getTeamQ.promise;
    }

    function getScoreboards(user, crytoUtils) {
        var deferred = q.defer();

        var scoreboards = [];
        var loginDefers = [];
        user.sites.forEach(function (site) {
            if (site.name === 'yahoo') {
                var username = crytoUtils.decrypt(site.username);
                var password = crytoUtils.decrypt(site.password);
                loginDefers.push(login(username, password));
            }
        });

        q.all(loginDefers).then(function (loginResults) {
            var defers = [];
            var loginIndex = 0;
            user.sites.forEach(function (site) {
                if (site.name === 'yahoo') {
                    var cookieJar = loginResults[loginIndex].cookieJar;
                    loginIndex++;

                    site.sports[0].teams.forEach(function (team) {
                        var url = team.leagueScoreboardUrl;
                        defers.push(getScoreboard(url, cookieJar));
                    });
                }
            });

            q.allSettled(defers).done(function (results) {
                results.forEach(function (result) {
                    if (result.state === 'fulfilled') {
                        scoreboards = scoreboards.concat(result.value);
                    }
                });
                deferred.resolve(scoreboards);
            });

        }, function (err) {
            deferred.reject(err);
        });


        return deferred.promise;
    }

    function getScoreboard(url, cookieJar) {
        console.log('Getting Yahoo scoreboard for ' + url);

        var deferred = q.defer();

        var request = require('request');
        var cheerio = require('cheerio');

        // Get team page and extract name, record, and players
        var scoreboardOptions = {
            url: url,
            method: 'GET',
            jar: cookieJar,
            followAllRedirects: true
        };

        request(scoreboardOptions, function (err, res, body) {
            if (err) {
                deferred.reject(err);
            } else {
                try {
                    var $ = cheerio.load(body);

                    var teams = [];

                    var teamNames = $('.Mawpx-175');
                    for (var i = 0; i < teamNames.length; i++) {
                        var teamName = teamNames[i].children[0].children[0].data;
                        teams[i] = {
                            name: teamName
                        };
                    }

                    var teamScores = $('.Fz-lg', '.Grid-table');
                    var teamProjected = $('.F-shade', '.Grid-table');
                    var teamRecords = $('.Va-top', '.Grid-table');
                    for (var i = 0; i < teamScores.length; i++) {
                        var teamScore = teamScores[i].children[0].data;
                        teams[i].score = teamScore;

                        var teamProj = teamProjected[i].children[0].data;
                        teams[i].projected = teamProj;

                        var teamRecord = teamRecords[i].children[3].children[0].data.replace(' ', '').split('|')[0];
                        teams[i].record = teamRecord;
                    }

                    var matchupCount = teams.length / 2;
                    var games = [];
                    var teamIndex = 0;
                    for (var i = 0; i < matchupCount; i++) {
                        games[i] = {
                            homeTeam: [teams[teamIndex]],
                            awayTeam: [teams[teamIndex + 1]]
                        };

                        teamIndex = teamIndex + 2;
                    }

                    var scoreboardName = $('.Mstart-xl')[0].children[0].children[0].data;
                    var scoreboard = {
                        name: scoreboardName,
                        type: 'football',
                        site: 'yahoo',
                        url: url,
                        games: games
                    };

                    deferred.resolve(scoreboard);
                } catch (err) {
                    deferred.reject(err);
                }
            }
        });

        return deferred.promise;
    }

    module.exports = {
        login: login,
        getScoreboards: getScoreboards,
        getScoreboard: getScoreboard,
        getTeams: function (username, password) {
            var resultQ = q.defer();

            login(username, password).then(function (data) {

                console.log('Getting Yahoo teams for username/password = ' + username + '/*****');

                // Load html from fantasy football screen to extract team names
                var $ = cheerio.load(data.body);

                var teamLinks = $('.Fz-sm').find('a');

                var promises = [];
                for (var i = 0; i < teamLinks.length; i++) {
                    var teamLink = teamLinks[i];
                    if (teamLink.attribs.href !== undefined && teamLink.attribs.href.indexOf('/f1/') > -1 && (i % 2 === 0)) {
                        var teamUrl = 'http://football.fantasysports.yahoo.com' + teamLink.attribs.href;
                        promises.push(getTeam(teamUrl, data.cookieJar));
                    }
                }

                // If no teams were found, don't add to account
                if (promises.length < 1) {
                    resultQ.reject(new Error('No teams found in this account.'));
                }

                q.allSettled(promises).done(function (results) {
                    var teams = [];
                    results.forEach(function (result) {
                        if (result.state === 'fulfilled') {
                            teams.push(result.value);
                        } else {
                            console.log(result.reason.message);
                        }
                    });
                    resultQ.resolve(teams);
                });

            }, function (err) {
                resultQ.reject(err);
            });

            return resultQ.promise;
        }
    };
}());