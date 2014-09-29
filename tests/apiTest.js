/**
 * Created by vijay.budhram on 7/11/14.
 */

var supertest = require('supertest');
var superagent = require('superagent');
var should = require('should');
var request = supertest('localhost:8080');
var app = require('../app');

var espnCredentials = require('../../fantasyCredentials.json').espn;
var yahooCredentials = require('../../fantasyCredentials.json').yahoo;

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
                email: 'vbudhram@gmail.com',
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

        describe('should get logged in user information', function () {
            var request = require('supertest');
            var agent = request.agent('localhost:8080');

            before('should add user', function (done) {

                var validUserInfo = {
                    email: 'vbudhram2@gmail.com',
                    password: 'password'
                };

                agent.post('/users')
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

            it('should login', function (done) {
                var validUserInfo = {
                    email: 'vbudhram2@gmail.com',
                    password: 'password'
                };

                agent.post('/doLogin')
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

            it('should get user', function (done) {
                agent.get('/users')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            var result = res.body;
                            result.should.not.be.null;
                            done();
                        }
                    });
            });
        });

    });

    describe('News API', function () {
        it('should update current headlines', function (done) {
            request.put('/news')
                .expect(204)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should get current headlines', function (done) {
            request.get('/news')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        res.body.length.should.be.greaterThan(0);
                        done();
                    }
                });
        });
    });

    describe('Site API', function () {
        it('should reject add espn site information for unauthorized users', function (done) {
            request.post('/espn')
                .send(espnCredentials)
                .expect(403)
                .end(function (err, res) {
                    done();
                });
        });

        describe('should add espn site information for users', function () {
            var request = require('supertest');
            var agent = request.agent('localhost:8080');

            before('should login', function (done) {
                var validUserInfo = {
                    email: 'vbudhram@gmail.com',
                    password: 'password'
                };

                agent.post('/doLogin')
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

            it('should add espn user information for users', function (done) {
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

            it('should get espn site information', function (done) {
                agent.get('/espn')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            it('should get espn football information', function (done) {
                agent.get('/espn/football')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            it('should add another espn account', function (done) {
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

            it('should reject invalid account', function (done) {
                agent.post('/espn')
                    .send({username: 'asdf', password: 'asdf'})
                    .expect(400)
                    .end(function (err, res) {
                        console.log(res.body);
                        done();
                    });
            });

            it('should add yahoo account', function (done) {
                agent.post('/yahoo')
                    .send(yahooCredentials)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            console.log(res.body);
                            done();
                        }
                    });
            });

            it('should get yahoo football information', function (done) {
                agent.get('/yahoo/football')
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

        describe('should remove espn site from account', function () {
            var request = require('supertest');
            var agent = request.agent('localhost:8080');

            var validUserInfo = {
                email: 'remove@gmail.com',
                password: 'password'
            };

            before('should add user', function (done) {
                agent.post('/users')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .send(validUserInfo)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            user = res.body;
                            done();
                        }
                    });
            });

            before('should login', function (done) {
                agent.post('/doLogin')
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

            it('should add espn site to account', function (done) {
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

            var user;
            it('should get user', function (done) {
                agent.get('/users')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            user = res.body;
                            done();
                        }
                    });
            });


            it('should remove espn site from account', function (done) {
                agent.delete('/espn/' + user.sites[0]._id)
                    .expect(204)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });

            it('should have user sites for user', function (done) {
                agent.get('/users')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            res.body.sites.length.should.equal(0);
                            done();
                        }
                    });
            });
        });
    });

    describe('Scoreboard API', function () {
        var request = require('supertest');
        var agent = request.agent('localhost:8080');

        var validUserInfo = {
            email: 'score@gmail.com',
            password: 'password'
        };

        before('should add user', function (done) {
            agent.post('/users')
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

        it('should login', function (done) {
            agent.post('/doLogin')
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

        it('should add espn user information for user', function (done) {
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

        it('should add espn scoreboards for user leagues', function (done) {
            agent.post('/scoreboard/espn/football')
                .expect(200)
                .end(function (err, res) {
                    done();
                });
        });

        it('should add yahoo user information for user', function (done) {
            agent.post('/yahoo')
                .send(yahooCredentials)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        res.should.not.be.null;
                        done();
                    }
                });
        });

        it('should add yahoo scoreboards for user leagues', function (done) {
            agent.post('/scoreboard/yahoo/football')
                .expect(200)
                .end(function (err, res) {
                    if(err){
                        done(err);;
                    }else{
                        res.should.not.be.null;
                        done();
                    }
                });
        });

        it('should add all scoreboards for user leagues', function (done) {
            agent.get('/scoreboards')
                .expect(200)
                .end(function (err, res) {
                    done();
                });
        });
    });
});