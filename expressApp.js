/**
 * Created by vbudhram on 8/7/14.
 */

'use strict';

//  Static variables
var HOST = process.env.HOST || 'localhost';
var PORT = process.env.PORT || 8080;
var APP_NAME = 'fantasy-football-io';
var DB_URL = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost:27017/fantasy-football';

// Required middleware
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');

// Database and models import
var db = require('./database/db')(DB_URL);

// Configure Passport
var passport = require('./auth/LocalStrategy')(db);

// Utils
var espnUtils = require('./utils/espnUtils');
var newsUtils = require('./utils/newsUtils');
var bcrypt = require('bcrypt');
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

// Route endpoints
var authRouter = new express.Router();

authRouter.post('/login', function (req, res, next) {
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
            return res.send(200);
        });
    })(req, res, next);
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
            var passwordHash = bcrypt.hashSync(req.body.password, 8);
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
        db.NewsArticle.find(req.query).exec(function (err, articles) {
            res.json(articles);
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

apiRouter.use('/espn', auth);

// Add espn team to logged in user
apiRouter.route('/espn')
    .post(function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        espnUtils.getTeams(username, password).then(function (teams) {
            // Add team to user
            // TODO Perform validation on teams
            if (req.user[0]) {
                db.User.find({'email': req.user[0].email}).exec(function (err, results) {
                    var user = results[0];
                    user.teams = user.teams.concat(teams);
                    user.save(function (err, result) {
                        if (err) {
                            res.send(400, err);
                        } else {
                            res.json(user);
                        }
                    });
                });
            }

        }, function (err) {
            res.send(400, err);
        });
    });

app.use(apiRouter);

app.listen(PORT, function () {
    console.log('Server started on ' + PORT);
});

// TODO find a better solution for doing timers
function updateNews() {
    // Timer to download the latest news articles
    newsUtils.currentHeadlines().then(function (articles) {
        console.log('Updated news articles');
        articles.forEach(function (article) {
            var newsArticle = new db.NewsArticle({
                title: article.title,
                url: article.url,
                date: article.date,
                source: article.source
            });

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