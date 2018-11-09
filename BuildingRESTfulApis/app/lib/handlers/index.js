/*
 * Request handlers
 *
 */

// Dependencies
var userHandler = require('./userHandler'); 
var tokenHandler = require('./tokenHandler');

// Define the handlers
var handlers = {};

// Private helpers
const getHandler = function (data, callback, handler) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handler[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Users handler
handlers.users = function(data, callback){
    getHandler(data, callback, userHandler);
};

// Tokens handler
handlers.tokens = function(data, callback){
    getHandler(data, callback, userHandler);
};

// Ping handler
handlers.ping = function (data, callback) {
    // Callback a http status code, and a payload object
    callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Export the module
module.exports = handlers;