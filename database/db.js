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

    var User = new mongoose.Schema({
        email: {type: String, trim: true, index: true, unique: true},
        passwordHash: String,
        teams: [Team]
    });

    return {
        User: mongoose.model('Users', User)
    };

//    return {
//        User: require('./schemas/User')(mongoose),
//        Team: require('./schemas/Team')(mongoose),
//        Player: require('./schemas/Player')(mongoose)
//    };
};