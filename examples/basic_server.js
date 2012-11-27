//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
	url = require('url');

//This variable attaches to the global object, so it is available in several sessions.
var userCount = 0;

//create the server by calling the createServer method on http, which returns a new httpServer.
http.createServer(function (request,response) {
	//line 14 is the same as the following three lines :
	//var rawPath = request.url
	//var theURL = url.parse(rawPath)
	//var path = theURL.pathname;
	var path = url.parse(request.url).pathname;

	getBody(path, function(err, body) {
        if (err) {
            response.writeHead(500, {
            'Content-Length': err.length,
            'Content-Type': 'text/html' })
            response.end(err);
            return
        }
        console.log(body);
        response.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/html' })
        response.end(body);
	});

//Here we use process.env.PORT to access the port given to this process. This is an environment variable available to you that will give you the port that your
//server is being hosted on.
}).listen(process.env.PORT);

//Here we have a function with standard node.js convention - err and "result".
//Err returns as undefined if there is no error, which is what is expected.
//we don't want it to throw any exceptions - if we did, we'd need to be very explicit in the documentation about that.
function getBody(path, callback) {
	userCount++;
    var body;
	if (path === '/basic') {
		body = 'usercount : ' + userCount;
	} else if (path === '/advanced') {
		body = '<!doctype html><html><head><title>Advanced Page</title></head><body>Hello! The user count is now : ' + userCount + '</body></html>';
		return;
	} else if (path === '/favicon.ico') {
		userCount--;
		body = 'x';
	} else {
		var err = 'You didn\'t specify a path!';
	}
    callback(err, body);
}