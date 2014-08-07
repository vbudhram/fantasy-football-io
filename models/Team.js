/**
 * Created by vbudhram on 8/5/14.
 */

'use strict';

function Team(name, shortName, record, rank) {
    this.name = name;
    this.record = record;
    this.shortName = shortName;
    this.rank = rank;
}

module.exports = Team;