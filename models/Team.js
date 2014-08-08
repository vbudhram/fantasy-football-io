/**
 * Created by vbudhram on 8/5/14.
 */

'use strict';

function Team(name, shortName, record, rank, url, players) {
    this.url = url;
    this.name = name;
    this.record = record;
    this.shortName = shortName;
    this.rank = rank;
    this.players = players;
}

module.exports = Team;