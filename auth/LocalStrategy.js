/**
 * Created by vbudhram on 8/10/14.
 */

'use strict';

module.exports = function (db, key) {
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var encryptionUtils = require('../utils/encryptionUtils')(key);

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
        function (username, password, done) {
            db.User.find({'email': username}).exec(function (err, user) {
                if (err) {
                    return done(err);
                }

                if (user.length === 0) {
                    return done(null, false, { message: 'Incorrect email.' });
                }

                encryptionUtils.compareHash(password, user[0].passwordHash, function(err, res){
                    if(!res){
                        return done(null, false, { message: 'Incorrect password.' });

                    }else{
                        return done(null, user);
                    }
                });
            });
        }
    )) ;

    return passport;
};