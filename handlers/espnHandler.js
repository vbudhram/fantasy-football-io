/**
 * Handlers for getting espn team data.
 *
 * Created by vijay.budhram on 7/11/14.
 */

(function () {
    'use strict';

    var ESPN = require('../utils/espnUtils');

    module.exports = {
        /**
         * Return all teams associated with the espn account specified. Check params or body for username.
         *
         * @param request
         * @param reply
         */
        getTeams: function (request, reply) {
            var username;
            var password;

            if(request.params.username && request.params.password){
                username = request.params.username;
                password = request.params.password;
            }else if(request.payload.username && request.payload.password) {
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
}());