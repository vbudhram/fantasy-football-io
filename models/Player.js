/**
 * Created by vbudhram on 8/7/14.
 */
'use strict';

function Player(playerName, playerTeamName, position, positionRank, totalPoints, averagePoints) {
    this.playerName = playerName;
    this.playerTeamName = playerTeamName;
    this.position = position;
    this.positionRank = positionRank;
    this.totalPoints = totalPoints;
    this.averagePoints = averagePoints;
}

module.exports = Player;