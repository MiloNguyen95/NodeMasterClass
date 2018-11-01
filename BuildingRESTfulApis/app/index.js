/*
 * Primary file for the API 
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Define the HTTP server
const httpServer = http.createServer(function (req, res) {
    unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
    console.log("The server is listening on port " + config.httpPort);
});

// Define the HTTPS server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
    console.log("The server is listening on port " + config.httpsPort);
});

// Unified server
var unifiedServer = function (req, res) {
    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the header as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to. If not found, go to not found
        var choosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specifid in the router
        choosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handler, or default 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert the payload to a String
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path  
            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
};

// Define the handlers
var handlers = {};

// Ping handler
handlers.ping = function (data, callback) {
    // Callback a http status code, and a payload object
    callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define a request router
const router = {
    'sample': handlers.sample
};