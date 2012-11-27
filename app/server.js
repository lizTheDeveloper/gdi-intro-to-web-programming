var http = require('http'),
    fs = require('fs'),
    url = require('url');

http.createServer(function (request,response) {

    var path = url.parse(request.url).pathname;
    path = '.' + path;
	getFile(path, function(err, body) {
        response.writeHead(body.statusCode, {
        'Content-Length': body.length,
        'Content-Type': 'text/html' })
        response.end(body.body, 'utf-8');
	});
}).listen(process.env.PORT);


function getFile(path, callback) {
    var response = {};
    fs.readFile(path, function(err, data) {
        if (err) {
            response.statusCode = 500;
            response.body = 'There was an error getting the requested file: ' + err;
            response.length = response.body.length;
            console.log(err);
        } else {
            response.statusCode = 200;
            response.body = data.toString();
            response.length = response.body.length;
        }
        callback(err, response);
    });
}