/**
 * Created by vbudhram on 8/10/14.
 */
module.exports = function (mongoose) {
    var playerSchema = new mongoose.Schema({
        name: {type: String},
        teamName: {type: String},
        positionRank: {type: Number},
        totalPoints: {type: Number},
        averagePoints: {type: Number}
    });

    return mongoose.model('Player', playerSchema);
};