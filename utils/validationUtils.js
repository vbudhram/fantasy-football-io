/**
 * Created by vbudhram on 8/7/14.
 */

(function () {
    'use strict';

    var Joi = require('joi');
    var q = require('q');

    var UserSchema = Joi.object().keys({
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
        email: Joi.string().email()
    }).with('email', 'password');

    module.exports.validateUser = function validateUser(data) {
        var deferred = q.defer();

        Joi.validate(data, UserSchema, function (err, value) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(value);
            }
        });

        return deferred.promise;
    };

    var TeamSchema = Joi.object().keys({
        name: Joi.string(),
        shortName: Joi.string(),
        record: Joi.string(),
        leagueRank: Joi.number().integer().min(0),
        logoUrl: Joi.string(),
        url: Joi.string()
    });

    module.exports.validateTeam = function validateTeam(data) {
        var deferred = q.defer();

        Joi.validate(data, TeamSchema, function (err, value) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(value);
            }
        });

        return deferred.promise;
    };
}());