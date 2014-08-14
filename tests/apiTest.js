/**
 * Created by vijay.budhram on 7/11/14.
 */

var supertest = require('supertest');
var superagent = require('superagent');
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
            var validUserInfo = {
                email: 'test@asdf.com',
                password: 'password'
            };

            request.post('/users')
                .expect('Content-Type', /json/)
                .expect(200)
                .send(validUserInfo)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should reject invalid user email', function (done) {
            var invalidUserInfo = {
                email: 'tasfdasdfasdfs',
                password: 'password'
            };

            request.post('/users')
                .expect('Content-Type', /json/)
                .expect(400)
                .send(invalidUserInfo)
                .end(function (err, res) {
                    done();
                });
        });

//        it('should get user', function (done) {
//            var userInfo = {
//                email: 'testEmail@asdf.com'
//            };
//
//            request.get('/users')
//                .expect('Content-Type', /json/)
//                .expect(200)
//                .send(userInfo)
//                .end(function (err, res) {
//                    if (err) {
//                        done(err);
//                    } else {
//                        var result = res.body;
//                        result.email.should.equal(userInfo.email);
//                        done();
//                    }
//                });
//        });
    });

    describe.only('News API', function () {
        it('should get current headlines', function (done) {
            request.get('/news')
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

    describe('Team API', function () {
        it('should reject add espn team information for unauthorized users', function (done) {
            request.post('/espn')
                .send(espnCredentials)
                .expect(403)
                .end(function (err, res) {
                    done();
                });
        });

        describe('should add espn team information for users', function () {
            var request = require('supertest');
            var agent = request.agent('localhost:8080');

            before('should login', function (done) {
                var validUserInfo = {
                    email: 'test@asdf.com',
                    password: 'password'
                };

                agent.post('/login')
                    .send(validUserInfo)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            it('should add espn team information for users', function (done) {
                agent.post('/espn')
                    .send(espnCredentials)
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
});