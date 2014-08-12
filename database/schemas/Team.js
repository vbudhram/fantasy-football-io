/**
 * Created by vbudhram on 8/10/14.
 */
'use strict';

module.exports = function (mongoose) {
    var teamSchema = new mongoose.Schema({
        name: {type: String},
        shortName: {type: String},
        record: {type: String},
        leagueRank: {type: Number},
        logoUrl: {type: String},
        url: {type: String},
        players: [mongoose.Schema.Types.Player]
    });

    return mongoose.model('Team', teamSchema);
};