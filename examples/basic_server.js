//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
	url = require('url');

//This variable attaches to the global object, so it is available in several sessions.
var userCount = 0;

//create the server by calling the createServer method on http, which returns a new httpServer.
var server = http.createServer(function (request,response) {
	//line 14 is the same as the following three lines :
	//var rawPath = request.url
	//var theURL = url.parse(rawPath)
	//var path = theURL.pathname;
	var path = url.parse(request.url).pathname;

	body = getBody(path);
	console.log(body);
	
	response.writeHead(200, {
  	'Content-Length': body.length,
  	'Content-Type': 'text/html' })
  	response.end(body);

}).listen(8080);


function getBody(path) {
	userCount++;
	if (path === '/basic') {
		return 'usercount : ' + userCount;
	} else if (path === '/advanced') {
		body = '<!doctype html><html><head><title>Advanced Page</title></head><body>Hello! The user count is now : ' + userCount + '</body></html>';
		return body;
	} else if (path === '/favicon.ico') {
		userCount--;
		return 'x';
	} else {
		body = 'You didn\'t specify a path!';
	}
}