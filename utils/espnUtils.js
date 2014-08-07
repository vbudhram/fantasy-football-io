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

        var request = require('request');
        var cheerio = require('cheerio');

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
                var $ = cheerio.load(body);
                var link = $('a');

                var nameTokens = $('h3').filter('.team-name');
                if (nameTokens.length < 1) {
                    getTeamQ.reject(new Error('Unsupported team url : ' + teamURL));

                } else {
                    var teamName = nameTokens[0].children[0].data.trim();
                    var shortName = nameTokens[0].children[1].children[0].data;
                    shortName = (shortName ? shortName : '').replace('(', '').replace(')', '');
                    var record = $('.games-univ-mod4')[0].children[0].children[1].data.trim();
                    var rank = $('.games-univ-mod4')[0].children[0].children[2].children[0].data.replace('(', '').replace(')', '');
                    var team = new Team(teamName, shortName, record, rank);
                    console.log('Resolving team data for ' + teamURL);
                    getTeamQ.resolve(team);
                }
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

                for (var i = 0; i < teamLinks.length; i++) {
                    var teamLink = teamLinks[i];
                    if (teamLink.attribs.href !== undefined && teamLink.attribs.href.indexOf('teamId') > -1) {
                        promises.push(getTeam(teamLink.attribs.href, data.cookieJar));
                    }
                }

                q.allSettled(promises).done(function (results) {
                    var teams = [];
                    results.forEach(function(result){
                        if(result.state === 'fulfilled'){
                            teams.push(result.value);
                        }else{
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

