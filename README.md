fantasy-football-io
===================

This is an API that scrapes ESPN fantasy football site.

###Run Server
```bash
node app.js
```

###Test API
To get your league information simply POST to http://localhost:8080/espn with

```json
{
  "username":"yourname",
  "password":"yourpassword"
}
```
Example response
```json
[
    {
        "url": "http://games.espn.go.com/ffl/clubhouse?leagueId=765690&teamId=8&seasonId=2013",
        "name": "What would Jones-Drew?",
        "record": "8-5",
        "shortName": "COOL",
        "rank": "1st",
        "players": [
            {
                "playerName": "Peyton Manning",
                "playerTeamName": "Den QB",
                "position": "QB",
                "positionRank": "1",
                "totalPoints": "410",
                "averagePoints": "25.6"
            },
            {
                "playerName": "Maurice Jones-Drew",
                "playerTeamName": "Oak RB",
                "position": "RB",
                "positionRank": "19",
                "totalPoints": "187",
                "averagePoints": "11.7"
            },
            {
                "playerName": "Steven Jackson",
                "playerTeamName": "Atl RB",
                "position": "RB",
                "positionRank": "29",
                "totalPoints": "148.3",
                "averagePoints": "9.3"
            },
            {
                "playerName": "Greg Jennings",
                "playerTeamName": "Min WR",
                "position": "RB/WR",
                "positionRank": "34",
                "totalPoints": "172.4",
                "averagePoints": "10.8"
            },
            {
                "playerName": "Jordy Nelson",
                "playerTeamName": "GB WR",
                "position": "WR",
                "positionRank": "13",
                "totalPoints": "264.4",
                "averagePoints": "16.5"
            },
            {
                "playerName": "Harry Douglas",
                "playerTeamName": "Atl WR",
                "position": "WR",
                "positionRank": "24",
                "totalPoints": "199.7",
                "averagePoints": "12.5"
            },
            {
                "playerName": "Julius Thomas",
                "playerTeamName": "Den TE",
                "position": "TE",
                "positionRank": "3",
                "totalPoints": "215.8",
                "averagePoints": "13.5"
            },
            {
                "playerName": "Seahawks D/ST",
                "playerTeamName": "D/ST",
                "position": "D/ST",
                "positionRank": "1",
                "totalPoints": "195",
                "averagePoints": "12.2"
            }
        ]
    }
]
```
