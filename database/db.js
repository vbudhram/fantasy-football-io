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
        playerName: {type: String},
        playerTeamName: {type: String},
        positionRank: {type: Number},
        totalPoints: {type: Number},
        averagePoints: {type: Number}
    });

    var Team = new mongoose.Schema({
        name: {type: String},
        shortName: {type: String},
        record: {type: String},
        rank: {type: String},
        teamImageUrl: {type: String},
        teamUrl: {type: String},
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
        NewsArticle: mongoose.model('NewsArticle', NewsArticle)
    };

//    return {
//        User: require('./schemas/User')(mongoose),
//        Team: require('./schemas/Team')(mongoose),
//        Player: require('./schemas/Player')(mongoose)
//    };
};