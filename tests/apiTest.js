/**
 * Created by vijay.budhram on 7/11/14.
 */

var supertest = require('supertest');
var should = require('should');
var request = supertest('localhost:8080');
var app = require('../expressApp');

var espnCredentials = require('../../fantasyCredentials.json');

var connectionUrl = 'mongodb://127.0.0.1:27017/fantasy-football';
before('should clean database', function (done) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(connectionUrl, function (err, db) {
        if (err) throw err;

        db.dropDatabase(function (err, result) {
            done();
        });

    });
});

describe('Fantasy Football IO API Test', function () {
    it('should retrieve about', function (done) {
        request.get('/about')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    describe('User API', function (done) {
        it('should add valid user', function (done) {
            var userInfo = {
                email: 'testEmail@asdf.com',
                password: 'password'
            };

            request.post('/users')
                .expect('Content-Type', /json/)
                .expect(200)
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should reject invalid user email', function (done) {
            var userInfo = {
                email: 'tasfdasdfasdfs',
                password: 'password'
            };

            request.post('/users')
                .expect('Content-Type', /json/)
                .expect(400)
                .send(userInfo)
                .end(function (err, res) {
                    done();
                });
        });

        it('should get user', function (done) {
            var userInfo = {
                email: 'testEmail@asdf.com'
            };

            request.get('/users')
                .expect('Content-Type', /json/)
                .expect(200)
                .send(userInfo)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        var result = res.body;
                        result.email.should.equal(userInfo.email);
                        done();
                    }
                });
        });
    });

    describe('Team API', function () {
        it('should add espn team information to user', function (done) {
            request.post('/espn')
                .send(espnCredentials)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
    });
});