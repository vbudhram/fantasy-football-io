/**
 * Created by vbudhram on 8/10/14.
 */

'use strict';

module.exports = function (connectionUrl) {
    var mongoose = require('mongoose');
    mongoose.connect(connectionUrl, function (err, res) {
        if (err) {
            console.log('ERROR connecting to mongodb: ' + connectionUrl + '. ' + err);
        } else {
            console.log('Connected to mongodb: ' + connectionUrl);
        }
    });

    // Live Scoring Models
    var LeagueTeam = new mongoose.Schema({
        name: {type: String},
        score: {type: String},
        record: {type: String},
        inPlay: {type: String},
        yetToPlay: {type: String},
        projected: {type: String}
    });

    var LeagueMatchup = new mongoose.Schema({
        homeTeam: [LeagueTeam],
        awayTeam: [LeagueTeam]
    });

    var LeagueScoreboard = new mongoose.Schema({
        name: {type: String},
        type: {type: String},
        site: {type: String},
        url: {type: String, unique: true},
        games: [LeagueMatchup]
    });

    // Player Research Models
    var Stat = new mongoose.Schema({
        pa_yard: {type: String},
        pa_ca: {type: String},
        pa_td: {type: String},
        pa_int: {type: String},
        ru_att: {type: String},
        ru_td: {type: String},
        ru_yard: {type: String},
        re_att: {type: String},
        re_td: {type: String},
        re_yard: {type: String}
    });

    var PlayerStat = new mongoose.Schema({
        name: {type: String},
        position: {type: String},
        team: {type: String},
        opponent: {type: String},
        image: {type: String},
        week: {type: String},
        site: {type: String},
        stats: [Stat]
    });

    // News Models
    var NewsArticle = new mongoose.Schema({
        title: {type: String},
        author: {type: String},
        url: {type: String, trim: true, unique: true},
        mediaUrl: {type: String},
        metatags: {type: Array},
        date: {type: Date},
        source: {type: String, index: true}
    });

    // Team Models
    var Player = new mongoose.Schema({
        position: {type: String},
        playerName: {type: String},
        playerTeamName: {type: String},
        opponent: {type: String},
        positionRank: {type: Number},
        totalPoints: {type: Number},
        averagePoints: {type: Number},
        projectedPoints: {type: Number},
        previousPoints: {type: Number},
        playerImage: {type: String}
    });

    var Team = new mongoose.Schema({
        active: {type: Boolean},
        name: {type: String},
        shortName: {type: String},
        record: {type: String},
        rank: {type: String},
        teamImageUrl: {type: String},
        teamUrl: {type: String},
        leagueName: {type: String},
        leagueScoreboardUrl: {type: String},
        players: [Player]
    });

    var Sport = new mongoose.Schema({
        name: {type: String},
        teams: [Team]
    });

    var Site = new mongoose.Schema({
        name: {type: String},
        siteUrl: {type: String},
        username: {type: String},
        password: {type: String},
        sports: [Sport]
    });

    var User = new mongoose.Schema({
        email: {type: String, trim: true, index: true, unique: true},
        passwordHash: String,
        sites: [Site]
    });

    return {
        User: mongoose.model('Users', User),
        NewsArticle: mongoose.model('NewsArticle', NewsArticle),
        LeagueScoreboard: mongoose.model('LeagueScoreboard', LeagueScoreboard),
        PlayerStat: mongoose.model('Player', PlayerStat)
    };
};