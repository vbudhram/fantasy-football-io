/**
 * Created by vbudhram on 8/10/14.
 */

'use strict';

module.exports = function(mongoose){
    var userSchema = new mongoose.Schema({
        email: {type: String, trim: true, index: true, unique: true},
        passwordHash: String,
        teams: [mongoose.Schema.Types.Team]
    });

    return mongoose.model('Users', userSchema);
};