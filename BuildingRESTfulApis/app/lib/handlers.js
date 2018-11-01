/*
 * Request handlers
 *
 */

// Define the handlers
var handlers = {};

// Users handler
handlers.users = function(data, callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    }else{
        callback(405);
    }
};

// Container for the users submethod
handlers._users = {};

// Users - post
handlers._users.post = function(data, callback){

};

// Users - get
handlers._users.get = function(data, callback){

};

// Users - put
handlers._users.put = function(data, callback){

};

// Users - delete
handlers._users.delete = function(data, callback){

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