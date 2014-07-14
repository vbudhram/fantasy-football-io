/**
 * Functions that get scrape information from the espn team website.
 *
 * Created by vijay.budhram on 7/11/14.
 */
(function () {
    'use strict';
    module.exports = {
        getTeams: function (username, password) {
            console.log('Getting teams for username/password = ' + username + '/' + password);
            var data = require('../tests/getTeamsData.json');
            return data;
        }
    };
}());

