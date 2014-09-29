/**
 * Created by vbudhram on 8/5/14.
 */

describe('Yahoo Test', function () {
    var credentials = require('../../fantasyCredentials.json');

    var YAHOO = require('../utils/yahooUtils');
    var username = credentials.yahoo.username;
    var password = credentials.yahoo.password;

    it('should login user', function (done) {
        YAHOO.login(username, password).then(function(data){
            data.body.should.not.be.null;
            data.cookieJar.should.not.be.null;
            done();
        }, function(err){
            done(err);
        });
    });

    it('should get user team information', function (done) {
        YAHOO.getTeams(username, password).then(function (data) {
            console.log(JSON.stringify(data));
            done();
        }, function (err) {
            done(err);
        });
    });

    it('should save scoreboard for each league', function (done) {
        var username = credentials.yahoo.username;
        var password = credentials.yahoo.password;
        var url = 'http://football.fantasysports.yahoo.com/f1/14813';
        YAHOO.login(username, password).then(function(data){
            var cookieJar = data.cookieJar;
            YAHOO.getScoreboard(url, cookieJar).then(function(data){
                data.should.not.be.null;
                done();
            }, function(err){
                done(err);
            });
        });
    });
});