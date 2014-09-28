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
    var Team = require('../models/Team');
    var Player = require('../models/Player');
    var LOGIN_URL = 'https://r.espn.go.com/members/util/loginUser';
    var FRONTPAGE_URL = 'http://games.espn.go.com/frontpage/';

    function login(username, password) {
        console.log('Logging into ESPN with username/password = ' + username + '/*****');

        var j = request.jar();

        var resultQ = q.defer();
        var loginForm = {
            username: username,
            password: password,
            appRedirect: FRONTPAGE_URL,
            parentLocation: FRONTPAGE_URL,
            language: 'en'
        };

        var loginOptions = {
            url: LOGIN_URL,
            method: 'POST',
            form: loginForm,
            jar: j,
            followAllRedirects: true
        };

        request(loginOptions, function (err, res, body) {
            if (err) {
                resultQ.reject(err);
            } else {

                // Issue request for front page
                var frontPageOptions = {
                    url: FRONTPAGE_URL,
                    method: 'GET',
                    jar: j,
                    followAllRedirects: true
                };
                request(frontPageOptions, function (err, res, body) {
                    if (err) {
                        resultQ.reject(err);
                    } else {
                        resultQ.resolve({cookieJar: j, body: body});
                    }
                });
            }
        });

        return resultQ.promise;
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
                try {
                    var $ = cheerio.load(body);

                    var nameTokens = $('h3').filter('.team-name');
                    if (nameTokens.length < 1) {
                        getTeamQ.reject(new Error('Unsupported team url : ' + teamUrl));
                    } else {
                        // Scrape team player information
                        var players = [];
                        var playerCells = $('.pncPlayerRow');
                        var active = false;
                        for (var i = 0; i < playerCells.length; i++) {
                            try {
                                var cell = playerCells[i];

                                // Don't add empty players
                                if (cell.children[1].children[0].children === undefined) {
                                    continue;
                                }

                                var playerName = cell.children[1].children[0].children[0].data;
                                var playerTokens = cell.children[1].children[1].data.replace(',', "").replace('*', "").trim().split(/[^\u000A\u0020-\u007E]/g);
                                var playerTeamName = playerTokens[0];
                                var position = playerTokens[1];

                                if (teamUrl.indexOf('2014') > -1) {
                                    // TODO Figure this out later, not sure how to handle current year, point and rankings
                                    var slot = cell.children[0].children[0].data;

                                    var opponent;
                                    try {
                                        opponent = cell.children[4].children[0].children[0].children[0].data;
                                    } catch (e) {
                                        opponent = '';
                                    }

                                    var projectedPoints = 0;
                                    try {
                                        projectedPoints = cell.children[12].children[0].data;
                                        if(projectedPoints === '--'){
                                            projectedPoints = 0;
                                        }
                                    } catch (e) {
                                    }

                                    var previousPoints = 0;
                                    try {
                                        previousPoints = cell.children[10].children[0].data;
                                    } catch (e) {
                                    }

                                    var averagePoints = cell.children[9].children[0].data;

                                    var playerId = cell.children[1].children[0].attribs.playerid;
                                    var playerImage = 'http://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/' + playerId + '.png&w=200&h=145';

                                    var player = {
                                        position: position,
                                        playerName: playerName,
                                        playerTeamName: playerTeamName,
                                        opponent: opponent,
                                        averagePoints: averagePoints,
                                        previousPoints: previousPoints,
                                        projectedPoints: projectedPoints,
                                        playerImage: playerImage
                                    };

                                    players.push(player);
                                    active = true;
                                } else {
                                    // ESPN has different layouts for previous years
                                    var positionRank = cell.children[3].children[0].data;
                                    var totalPoints = cell.children[4].children[0].data;
                                    var averagePoints = cell.children[5].children[0].data;
                                    players.push(new Player(playerName, playerTeamName, position, positionRank, totalPoints, averagePoints));
                                }
                            } catch (err) {
                                console.log('Failed parsing player : ' + playerName);
                                console.log(err.stack);
                            }
                        }
                        // Scrape team information
                        var teamName = nameTokens[0].children[0].data.trim();
                        var shortName = nameTokens[0].children[1].children[0].data;
                        shortName = (shortName ? shortName : '').replace('(', '').replace(')', '');
                        var record = $('.games-univ-mod4')[0].children[0].children[1].data.trim();
                        var rank = $('.games-univ-mod4')[0].children[0].children[2].children[0].data.replace('(', '').replace(')', '');
                        var teamImageUrl = $('#content > div:nth-child(1) > div.gamesmain.container > div > div > div:nth-child(3) > div.games-topcol.games-topcol-expand > div.games-univ-mod1 > a > img')[0].attribs.src;
                        var leagueName = $('#content > div:nth-child(1) > div.gamesmain.container > div > div > div:nth-child(3) > div.games-topcol.games-topcol-expand > div:nth-child(2) > div.games-univ-mod3 > ul:nth-child(2) > li > a > strong')[0].children[0].data;

                        var tokens = teamUrl.replace('clubhouse', 'scoreboard').split('&');
                        var scoreboardUrl = tokens[0] + '&' + tokens[2];
                        console.log('Resolving team data for ' + teamUrl);

                        var team = {
                            active: active,
                            name: teamName,
                            shortName: shortName,
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
                } catch (err) {
                    getTeamQ.reject(err);
                }
            }
        });

        return getTeamQ.promise;
    }

    function getHeadlines() {
        var getNewsQ = q.defer();

        console.log('Getting headlines at url : ' + FRONTPAGE_URL);

        var cheerio = require('cheerio');

        var newsOptions = {
            url: FRONTPAGE_URL,
            method: 'GET',
            followAllRedirects: true
        };
        request(newsOptions, function (err, res, body) {
            if (err) {
                getNewsQ.reject(err);
            } else {
                var $ = cheerio.load(body);

                var newsArticles = [];

                var links = $('a');
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    // Check to see if this is a news article
                    if (link.attribs.href && link.attribs.href.indexOf('/fantasy/football/story') > -1) {
                        newsArticles.push({
                            title: link.children[0].data,
                            url: link.attribs.href,
                            date: new Date(),
                            source: 'ESPN Football'
                        });
                    }
                }

                getNewsQ.resolve(newsArticles);
            }
        });

        return getNewsQ.promise;
    }

    function getScoreboards(user, crytoUtils) {
        var deferred = q.defer();

        var scoreboards = [];
        var loginDefers = [];
        user.sites.forEach(function (site) {
            if (site.name === 'espn') {
                var username = crytoUtils.decrypt(site.username);
                var password = crytoUtils.decrypt(site.password);
                loginDefers.push(login(username, password));
            }
        });

        q.all(loginDefers).then(function (loginResults) {
            var defers = [];
            for (var i = 0; i < loginResults.length; i++) {
                var cookieJar = loginResults[i].cookieJar;
                var site = user.sites[i];

                site.sports[0].teams.forEach(function (team) {
                    var url = team.leagueScoreboardUrl;
                    defers.push(getScoreboard(url, cookieJar));
                });
            }

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
        console.log('Getting ESPN scoreboard for ' + url);

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
                    var names = $('.name');
                    for (var i = 0; i < names.length; i++) {
                        var name = names[i].children[0].children[0].data;
                        if (teams[i] === undefined) {
                            teams[i] = {};
                        }

                        teams[i].name = name;
                    }

                    var scores = $('.score');
                    var records = $('.record');
                    for (var i = 0; i < scores.length; i++) {
                        var score = scores[i].children[0].data;
                        var record = records[i].children[0].data;
                        teams[i].score = score;
                        teams[i].record = record;
                    }

                    try {
                        var plays = $('.playersPlayed');
                        for (var i = 0; i < plays.length; i++) {
                            var ytp = plays[i].children[0].children[0].data;
                            var ip = plays[i].children[1].children[0].data;
                            var proj = plays[i].children[3].children[0].data;
                            teams[i].yetToPlay = ytp;
                            teams[i].inPlay = ip;
                            teams[i].projected = proj;
                        }
                    } catch (e) {
                        console.log(e);
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

                    var scoreboardName = $('#content > div:nth-child(1) > div.gamesmain.container > div > div > div.games-fullcol.games-fullcol-extramargin > div.games-pageheader > div:nth-child(2) > h1')[0].children[0].data;
                    var scoreboard = {
                        name: scoreboardName,
                        type: 'football',
                        site: 'espn',
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
        getHeadlines: getHeadlines,
        getScoreboards: getScoreboards,
        getScoreboard: getScoreboard,
        getTeams: function (username, password) {
            var resultQ = q.defer();

            login(username, password).then(function (data) {

                console.log('Getting ESPN teams for username/password = ' + username + '/*****');

                // Load html from fantasy football screen to extract team names
                var $ = cheerio.load(data.body);

                var teamLinks = $('a').filter('.clubhouse-link');

                var promises = [];
                for (var i = 0; i < teamLinks.length; i++) {
                    var teamLink = teamLinks[i];
                    if (teamLink.attribs.href !== undefined && teamLink.attribs.href.indexOf('teamId') > -1) {
                        promises.push(getTeam(teamLink.attribs.href, data.cookieJar));
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