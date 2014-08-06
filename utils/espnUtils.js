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

    function getTeam(teamURL, cookieJar) {
        var getTeamQ = q.defer();

        console.log('Getting team for link = ' + teamURL);

        // Get team page and extract name, record, and players
        var teamPageOptions = {
            url: teamURL,
            method: 'GET',
            jar: cookieJar,
            followAllRedirects: true
        };
        request(teamPageOptions, function (err, res, body) {
            if (err) {
                getTeamQ.reject(err);
            } else {
                // Extract team info
                //var $ = cheerio(body.body);
                var team = new Team('asdf', '123');

                console.log('Resolving team data for ' + teamURL);
                getTeamQ.resolve("stuff");
            }
        });

        return getTeamQ.promise;
    }

    module.exports = {
        getTeams: function (username, password) {
            var resultQ = q.defer();

            login(username, password).then(function (data) {

                console.log('Getting ESPN teams for username/password = ' + username + '/*****');

                // Load html from fantasy football screen to extract team names
                var $ = cheerio.load(data.body);
                //var teamLinks = $('.clubhouse-link').attr('href');
                //teamLinks = (teamLinks instanceof Array) ? teamLinks : [teamLinks];

                var teamLinks = $('a').filter('.clubhouse-link');

                var promises = [];

//                for (var teamLink in teamLinks) {
//                    if (teamLinks.hasOwnProperty(teamLink)) {
//                        if (teamLinks[teamLink].attribs.href !== undefined && teamLinks[teamLink].attribs.href.indexOf('teamId') > -1) {
//                            promises.push(getTeam(teamLinks[teamLink].attribs.href, data.cookieJar).timeout(1000,'Timeout for link ' + teamLinks[teamLink]));
//                        }
//                    }
//                }
                var keys = Object.keys(teamLinks);
                keys.forEach(function (key) {
                    var teamLink = teamLinks[key];
                    if (teamLink.attribs.href !== undefined && teamLink.attribs.href.indexOf('teamId') > -1) {
                        promises.push(getTeam(teamLink.attribs.href, data.cookieJar));
                    }
                    console.log('Looping');
                });

                q.all(promises).then(function (results) {
                    var teams = [];
                    results.forEach(function (result) {
                        if (result.state === "fulfilled") {
                            teams.push(result.value);
                        } else {
                            console.log('Did not push team information because of reason : ' + result.reason);
                        }
                    });
                    resultQ.resolve(teams);
                }, function (err) {
                    resultQ.reject(err);
                });

            }, function (err) {
                resultQ.reject(err);
            });


            return resultQ.promise;
        }
    };
}());

