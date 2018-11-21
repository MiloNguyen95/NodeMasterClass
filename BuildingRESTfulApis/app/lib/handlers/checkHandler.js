/*
 * Checks handler
 *
 */

// Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var configs = require('../config');

// Container for all the check methods
var checkHandler = {};

// Checks - post
// Required data: protocol, url, method, sucessCodes, timeoutSeconds
// Optional data: none
checkHandler.post = function (data, callback) {
    // Validate
    var protocol = typeof (data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var sucessCodes = typeof (data.payload.sucessCodes) == 'object' && data.payload.sucessCodes instanceof Array && data.payload.sucessCodes.length > 0 ? data.payload.sucessCodes : false;
    var timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && sucessCodes && timeoutSeconds) {
        // Get the token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('token', token, function (err, tokenData) {
            if (!err && tokenData) {
                var userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, function (err, userData) {
                    if (!err && userData) {
                        var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // Verify that the user has less than the number of max check per user
                        if (userChecks.length < configs.maxChecks) {
                            // Create a random id for the check
                            var checkId = helpers.createRandomString(20);

                            // Create the check object, and include the user's phone
                            var checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'sucessCodes': sucessCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            // Save the object
                            _data.create('checks', checkId, checkObject, function (err) {
                                if (!err) {
                                    // Add the check id to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);
                                    
                                    // Save the new user data
                                    _data.update('users', userPhone, userData, function(err){
                                        if(!err){
                                            // Return the data about the new check
                                            callback(200, checkObject);
                                        }else{
                                            callback(500, {'Error': 'Could not update the user with the new check'})
                                        }
                                    })
                                } else {
                                    callback(500, { 'Error': 'Could not create the new check' });
                                }
                            })
                        } else {
                            callback(400, { 'Error': 'The user already has the maximum number of checks (' + configs.maxChecks + ')' });
                        }
                    } else {
                        callback(403)
                    }
                })
            } else {
                callback(403);
            }
        })

    } else {
        callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' })
    }
};

module.exports = checkHandler;