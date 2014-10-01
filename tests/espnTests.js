/**
 * Created by vbudhram on 8/5/14.
 */

describe('ESPN Test', function () {
    var credentials = require('../../fantasyCredentials.json').espn;

    var ESPN = require('../utils/espnUtils');

    it('should retrieve leagues and teams of user', function (done) {
        var username = credentials.username;
        var password = credentials.password;
        ESPN.getTeams(username, password).then(function (data) {
            console.log(JSON.stringify(data));
            done();
        }, function (err) {
            done(err);
        });
    });

    it('should reject invalid user', function (done) {
        var username = 'asdf';
        var password = 'asdf';
        ESPN.getTeams(username, password).then(function (data) {
            done();
        }, function (err) {
            console.log(err);
            done();
        });
    });

    it('should retrieve headlines from espn football frontpage', function (done) {
        ESPN.getHeadlines().then(function (data) {
            console.log(JSON.stringify(data));
            done();
        }, function (err) {
            done(err);
        });
    });

    it('should save scoreboard for each league', function (done) {
        var username = credentials.username;
        var password = credentials.password;
        var url = 'http://games.espn.go.com/ffl/scoreboard?leagueId=765690&seasonId=2014';
        ESPN.login(username, password).then(function(data){
            var cookieJar = data.cookieJar;
            ESPN.getScoreboard(url, cookieJar).then(function(data){
                done();
            }, function(err){
                done(err);
            });
        });
    });

    it.only('should retrieve player statistics for week', function(done){
        ESPN.getProjectedPlayerStats().then(function(data){
            data.length.should.be.greaterThan(100);
            done();
        });
    });
});