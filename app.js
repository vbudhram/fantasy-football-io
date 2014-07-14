/**
 * Created by vijay.budhram on 7/11/14.
 */

var HOST = process.env.HOST || 'localhost';
var PORT = process.env.PORT || 8080;
var APP_NAME = 'fantasy-football-io';

var Hapi = require('hapi');
var Good = require('good');
var Joi = require('joi');
var espnHandler = require('./handlers/espnHandler');

var server = new Hapi.Server(HOST, PORT);
var Types = Hapi.Types;

server.route({
    method: 'GET',
    path: '/about',
    handler: function (req, res) {
        res({
            version: '0.0.1',
            name: APP_NAME
        })
    }
});

server.route({
    method: ['POST', 'PUT'],
    path: '/espn',
    config: {
        handler: espnHandler.getTeams
//        validation: {
//            payload: {
//                username: Joi.string().required(),
//                password: Joi.string().required()
//            }
//        }
    }
});

server.pack.register(Good, function (err) {
    if (err) {
        throw err;
    }
});

server.start(function () {
    server.log('info', APP_NAME + ' started at ' + server.info.uri);
});

