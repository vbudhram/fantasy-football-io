/**
 * Created by vbudhram on 9/2/14.
 */

'use strict';

var bcrypt = require('bcrypt');
var crypto = require('crypto');

module.exports = function (key) {
    var algorithm = 'aes256';

    return {
        hash: function (word) {
            return bcrypt.hashSync(word, 8);
        },
        compareHash: function (word, hash, cb) {
            bcrypt.compare(word, hash, cb);
        },
        encrypt: function (text) {
            var cipher = crypto.createCipher(algorithm, key);
            var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
            return encrypted;
        },
        decrypt: function (encrypted) {
            var decipher = crypto.createDecipher(algorithm, key);
            var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
            return decrypted;
        }
    };
};