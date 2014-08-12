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

authRouter.use(function (req, res, next) {
    // Check for user session
    if(req.session.passport.user){
        next();
    }else{
        res.send(403);
    }
});

app.use(authRouter);

var apiRouter = new express.Router();

apiRouter.use(authRouter); // Apply auth rules

apiRouter.route('/about')
    .all(function (req, res) {
        res.json({
            version: '0.0.1',
            name: APP_NAME
        });
    });

apiRouter.route('/espn')
    .post(function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        espnUtils.getTeams(username, password).then(function (teams) {
            res.json(teams);
        }, function (err) {
            res.send(400, err);
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
    })
    .get(function (req, res) {
        var email = req.body.email;

        db.User.find({'email': email}).exec(function (err, result) {
            if (err) {
                res.send(400, err);
            } else {
                res.json(result[0]);
            }
        });
    });

app.use(apiRouter);

app.listen(PORT, function () {
    console.log('Server started on ' + PORT);
});
