/**
 * Created by vbudhram on 8/5/14.
 */

'use strict';

function Team(name, shortName, record, rank, teamUrl, teamImageUrl, players) {
    this.name = name;
    this.record = record;
    this.shortName = shortName;
    this.rank = rank;
    this.players = players;
    this.teamImageUrl = teamImageUrl;
    this.teamUrl = teamUrl;
}

module.exports = Team;