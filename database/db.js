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

    return {
        User: require('./schemas/User')(mongoose),
        Team: require('./schemas/Team')(mongoose),
        Player: require('./schemas/Player')(mongoose)
    };
};