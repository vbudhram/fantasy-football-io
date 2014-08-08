/**
 * Created by vijay.budhram on 7/11/14.
 */

var supertest = require('supertest');
var should = require('should');
var request = supertest('localhost:8080');
var app = require('../app');

describe('Fantasy Football IO API Test', function () {
    /*
     {
     username: username,
     password: password
     }
     */
    var credentials = require('../../fantasyCredentials.json');

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

    it('should retrieve teams of user', function (done) {
        request.post('/espn')
            .send(credentials)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {

//                    var testData = require('../tests/getTeamsData.json');
//                    res.body.should.equal.testData;
                    done();
                }
            });
    });
});