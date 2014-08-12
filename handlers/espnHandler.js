/**
 * Handlers for getting espn team data.
 *
 * Created by vijay.budhram on 7/11/14.
 */

(function () {
    'use strict';

    module.exports = function(server){
        var ESPN = require('../utils/espnUtils')(server);
        return {
            /**
             * Return all teams associated with the espn account specified. Check params or body for username.
             *
             * @param request
             * @param reply
             */
            getTeams: function (request, reply) {
                var username;
                var password;

                if(request.payload.username && request.payload.password) {
                    username = request.payload.username;
                    password = request.payload.password;
                }

                ESPN.getTeams(username, password).then(function(result){
                    reply(result);
                }, function(err){
                    reply(err);
                });
            }
        };
    };
}());