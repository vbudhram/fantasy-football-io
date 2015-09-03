fantasy-football-io
===================

This is a Fantasy Football API that is used to scrape fantasy football news, leagues and player information. Please only use for testing purposes.

The fantasy news sites it supports are
- ESPN
- Yahoo
- CBS Sports
- Rotoworld
- USA Today

You can also import your fantasy football leagues and have live scoring for each.
- ESPN
- Yahoo (partial)

### Install
```bash
npm install
bower install
```

### Requirements
* Redis
* MongoDB

Create a mongo database "fantasy-football".

### Set Environment Variables
Create and modify .env file in root directory.

```
MONGOLAB_URI=mongodb://localhost:27017/fantasy-football
REDIS_SESSION_HOST=localhost
REDIS_SESSION_PORT=6379
REDIS_SESSOIN_PASS=''
```

### Run Server
```bash
node app.js
```

By default application will be running on http://localhost:8080

To import teams, you will need to signup for an account and login. After logging in, click profile picture and goto account setting where you can add accounts from ESPN and Yahoo.

Best of luck!
