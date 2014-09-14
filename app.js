/**
 * Created by vbudhram on 8/7/14.
 */

'use strict';

//  Static variables
var HOST = process.env.HOST || 'localhost';
var PORT = process.env.PORT || 8080;
var APP_NAME = 'fantasy-football-io';
var DB_URL = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost:27017/fantasy-football';
var env = process.env.NODE_ENV || 'development';
var salt = process.env.SALT || 'badSalt';

// Required middleware
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var io = require('socket.io');
var http = require('http');

// Database and models import
var db = require('./database/db')(DB_URL);

// Configure Passport
var passport = require('./auth/LocalStrategy')(db);

// Utils
var encryptionUtils = require('./utils/encryptionUtils')(salt);
var espnUtils = require('./utils/espnUtils');
var newsUtils = require('./utils/newsUtils');
var validationRules = require('./utils/validationUtils');

var app = express();

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Setup socketio
var server = http.Server(app);
var socketio = io(server);

// Scoreboard
var scoreboardWorker = require('./workers/scoreboardWorker')(socketio);


if (env === 'development') {
    app.use(express.static(__dirname + '/web'));
} else if (env === 'production' || env === 'staging') {
    app.use(express.static(__dirname + '/dist'));
}

// Route endpoints
var authRouter = new express.Router();

authRouter.post('/doLogin', function (req, res, next) {
    console.log('Logging in with user');
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.session.messages = [info.message];
            return res.send(400, info.message);
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }

            user[0].sites = undefined;
            var currentUser = {
                email: user[0].email
            };

            return res.send(200, currentUser);
        });
    })(req, res, next);
});

authRouter.post('/logout', function (req, res, next) {
    console.log('Logging out');
    req.logout();
    res.send(204);
});

app.use(authRouter);

var apiRouter = new express.Router();

apiRouter.route('/about')
    .all(function (req, res) {
        res.json({
            version: '0.0.1',
            name: APP_NAME
        });
    });

apiRouter.route('/users')
    .post(function (req, res) {
        validationRules.validateUser(req.body).then(function () {
            var passwordHash = encryptionUtils.hash(req.body.password);
            var newUser = new db.User({
                email: req.body.email,
                passwordHash: passwordHash
            });

            newUser.save(function (err, result) {
                if (err) {
                    res.send(400, err);
                } else {

                    res.json(result);
                }
            });
        }, function (err) {
            res.send(400, err);
        });
    });

apiRouter.route('/news')
    .get(function (req, res) {
        db.NewsArticle.find(req.query).sort({date: -1}).exec(function (err, articles) {
            res.json(articles);
        });
    })
    .put(function (req, res) {
        newsUtils.currentHeadlines().then(function (articles) {
            articles.forEach(function (article) {
                var newsArticle = new db.NewsArticle(article);
                newsArticle.save(function (err, result) {
                    if (!err) {
                        console.log('Saved article : ' + result);
                    }
                });
            });

            res.send(204);
        }, function (err) {
            res.send(400, err);
        });
    });

// Apply auth rules
function auth(req, res, next) {
    // Check for user session
    if (req.session.passport.user) {
        next();
    } else {
        res.send(403);
    }
}

apiRouter.use('/:site', auth);

apiRouter.route('/users', auth)
    .get(function (req, res) {
        db.User.find({'email': req.user[0].email}).exec(function (err, results) {
            var user = results[0];
            if (err) {
                res.send(400, err);
            } else {
                if (user) {
                    res.json(user);
                } else {
                    res.send(400, 'Invalid request');
                }

            }
        }, function (err) {
            res.send(400, err);
        });
    });

apiRouter.route('/:site')
    .get(function (req, res) {
        db.User.find({'email': req.user[0].email, 'sites.name': req.params.site}).exec(function (err, results) {
            var user = results[0];
            if (err) {
                res.send(400, err);
            } else {
                if (user) {

                    var apiResult = {
                        sites: []
                    };

                    user.sites.forEach(function (site) {
                        if (site.name === req.params.site) {
                            apiResult.sites.push(site);
                        }
                    });

                    res.json(apiResult);
                } else {
                    res.send(400, 'Invalid request');
                }

            }
        });
    })
    .post(function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

//        if (req.user[0]) {
//            res.send(400, 'No user is logged in');
//        }

        switch (req.params.site) {
            case 'espn':
            {
                db.User.find({'email': req.user[0].email}).exec(function (err, results) {
                    var user = results[0];

                    var site = {
                        name: 'espn',
                        username: encryptionUtils.encrypt(username),
                        password: encryptionUtils.encrypt(password),
                        sports: [
                            {
                                name: 'football',
                                teams: []
                            }
                        ]
                    };

                    espnUtils.getTeams(username, password).then(function (teams) {
                        // TODO Fix this when supporting multiple sites
                        site.sports[0].teams = teams;
                        user.sites.push(site);
                        user.save(function (err, result) {
                            if (err) {
                                res.send(400, err);
                            } else {
                                res.json(site);
                            }
                        });
                    }, function (err) {
                        res.status(400).send({ error: err.message });
                    });
                });
            }
        }
    });

apiRouter.route('/:site/:id')
    .delete(function (req, res) {
        var id = req.params.id;
        db.User.find({'email': req.user[0].email}).exec(function (err, results) {
            var user = results[0];
            if (err) {
                res.send(400, err);
            } else {
                if (user) {
                    user.sites.id(id).remove();
                    user.save(function (err, result) {
                        if (err) {
                            res.send(400, err);
                        } else {
                            res.send(204);
                        }
                    });

                } else {
                    res.send(400, 'Invalid request');
                }
            }
        });
    })

apiRouter.route('/:site/:sport')
    .get(function (req, res) {
        db.User.find({'email': req.user[0].email, 'sites.name': req.params.site}).exec(function (err, results) {
            var user = results[0];
            if (err) {
                res.send(400, err);
            } else {
                if (user) {
                    var teams = [];

                    // Combine all espn football teams
                    user.sites.forEach(function (site) {
                        if (site.name === req.params.site) {
                            site.sports.forEach(function (sport) {
                                if (sport.name === req.params.sport) {
                                    teams = teams.concat(sport.teams);
                                }
                            });
                        }
                    });

                    res.json({
                        teams: teams
                    });
                } else {
                    res.send(400);
                }
            }
        });
    });

apiRouter.route('/scoreboard/:site/:sport')
    .post(function (req, res) {
        db.User.find({'email': req.user[0].email, 'sites.name': req.params.site}).exec(function (err, results) {
            var user = results[0];
            if (user) {
                switch (req.params.site) {
                    case 'espn':
                    {
                        espnUtils.getScoreboards(user, encryptionUtils).then(function (scoreboards) {
                            db.LeagueScoreboard.create(scoreboards, function (err, result) {
                                var apiResult = {
                                    scoreboards: scoreboards
                                };

                                // Register boards with socketio for realtime score updates
                                // TODO Maybe move this to a register api call
                                scoreboardWorker.registerBoard({
                                    user: user,
                                    encryptionUtils: encryptionUtils,
                                    scoreboards: scoreboards
                                });

                                res.json(apiResult);
                            });
                        }, function (err) {
                            res.status(400).send({ error: err.message });
                        });
                    }
                }
            } else {
                res.send(400, {error: 'Unable to get user\'s scoreboard'});
            }
        });
    });

app.use(apiRouter);

//socketio.on('connection', function () {
//    console.log('Connected to socket!');
//});

server.listen(PORT, function () {
    console.log('Server started on ' + PORT);
});

// TODO find a better solution for doing timers
function updateNews() {
    // Timer to download the latest news articles
    newsUtils.currentHeadlines().then(function (articles) {
        console.log('Updated news articles');
        articles.forEach(function (article) {
            var newsArticle = new db.NewsArticle(article);

            newsArticle.save(function (err, result) {
                if (!err) {
                    console.log('Saved article : ' + result);
                }
            });
        });

        setTimeout(updateNews, 60000);
    }, function (err) {
        console.log('Updated news articles');
        setTimeout(updateNews, 60000);
    });
}
setTimeout(updateNews, 1000);

function updateScoreboards() {
    scoreboardWorker.processBoards().then(function (data) {
        console.log('Updated scoreboards');
        setTimeout(updateScoreboards, 5000);
    }, function (err) {
        console.log('Updated scoreboards');
        setTimeout(updateScoreboards, 5000);
    });
}
setTimeout(updateScoreboards, 1000);