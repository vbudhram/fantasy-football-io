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
                var $ = cheerio.load(body);

                var nameTokens = $('h3').filter('.team-name');
                if (nameTokens.length < 1) {
                    getTeamQ.reject(new Error('Unsupported team url : ' + teamUrl));
                } else {
                    // Scrape team player information
                    var players = [];
                    var playerCells = $('.pncPlayerRow');
                    for (var i = 0; i < playerCells.length; i++) {
                        var cell = playerCells[i];

                        // Don't add empty players
                        if (cell.children[1].children[0].children === undefined) {
                            continue;
                        }
                        var playerName = cell.children[1].children[0].children[0].data;

                        var position = cell.children[0].children[0].data;
                        var playerTeamName = cell.children[1].children[1].data.replace(',', "").trim();
                        var positionRank = cell.children[3].children[0].data;
                        var totalPoints = cell.children[4].children[0].data;
                        var averagePoints = cell.children[5].children[0].data;

                        players.push(new Player(playerName, playerTeamName, position, positionRank, totalPoints, averagePoints));
                    }

                    // Scrape team information
                    var teamName = nameTokens[0].children[0].data.trim();
                    var shortName = nameTokens[0].children[1].children[0].data;
                    shortName = (shortName ? shortName : '').replace('(', '').replace(')', '');
                    var record = $('.games-univ-mod4')[0].children[0].children[1].data.trim();
                    var rank = $('.games-univ-mod4')[0].children[0].children[2].children[0].data.replace('(', '').replace(')', '');
                    var teamImageUrl = $('#content > div:nth-child(1) > div.gamesmain.container > div > div > div:nth-child(3) > div.games-topcol.games-topcol-expand > div.games-univ-mod1 > a > img')[0].attribs.src;

                    console.log('Resolving team data for ' + teamUrl);
                    var team = new Team(teamName, shortName, record, rank, teamUrl, teamImageUrl, players);

                    getTeamQ.resolve(team);
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

    module.exports = {
        getHeadlines: getHeadlines,
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

