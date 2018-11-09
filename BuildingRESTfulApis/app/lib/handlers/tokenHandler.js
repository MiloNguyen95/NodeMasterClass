/*
 * Tokens handler
 *
 */

// Dependencies
var _data = require('../data');
var helpers = require('../helpers');

// Container for handler
var tokenHandler = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
tokenHandler.post = function(data, callback){
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        // Lookup the user who matches that phone number
        _data.read('users', phone, function(err,userData){
            if(!err && userData){
                // Hash the sent password, and compare it to the password stored in the user object
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // If valid, create a new token with a random name. Set expiration date 1 hour in the future
                    var tokenId = helpers.createRandomString(20);                    
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, function(err){
                        if(!err){
                            callback(200,tokenObject);
                        }else{
                            callback(500,{'Error': 'Could not create the new token'});
                        }
                    })
                }else{
                    callback(400,{'Error':'Password did not match the specified user\'s stored password'})
                }
            }else{
                callback(400, {'Error':'Could not find the specified user'})
            }     
        })
    }else{
        callback(400,{'Error':'Missing required field(s)'})
    }
};

// Tokens - get
// Required data: id
// Optional data: none
tokenHandler.get = function(data, callback){
    // Check that the id is valid
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the token
        _data.read('token', id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
};

// Tokens - put
tokenHandler.put = function(data, callback){

};

// Tokens - delete
tokenHandler.delete = function(data, callback){

};