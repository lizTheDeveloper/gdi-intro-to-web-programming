var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring');


http.createServer(function (request,response) {

    request.querystring = url.parse(request.url, true).query;


    request.addListener('data', function(chunk) {
        request.form += chunk.toString();
    });

    request.addListener('end', function() {

        if (request.method == 'POST') {
            request.form = qs.parse(request.form);
        }
        request.ended = true;
        assembleDocument(request, function(document) {
            document.headers = getHeaders(document);
            response.writeHead(document.statusCode, document.headers);
            response.end(document.body);
        });

    });

    request.addListener('close', function() {
        if (!request.ended) {
            request.terminated = true;
            return;
        }
    });

}).listen(process.env.PORT);


//this will return a document object with a body and some headers.
function assembleDocument(request, callback) {
    var document = {};
    document.path = '/app' + url.parse(request.url).pathname;
    if (document.path == '/app/') {
        document.path ='/app/index.html';
    }
    if (request.terminated){
        document.statusCode = 500;
        document.body = http.STATUS_CODES[500];
        callback(document);
    }
    fs.readFile('.' + document.path, function(err, data) {
        if (err) {
            document.statusCode = 500;
            document.body += http.STATUS_CODES[500] + '<br>There was an error getting the requested file: ' + err;
        } else {
            document.statusCode = 200;
            document.body = data.toString();
        }
        callback(document);
        return;
    });

}

function getHeaders(document) {
    var headers = {
        'Content-Length' : document.body.length,
        'Content-Type' : getType(document)
    };
    return headers;
}

function getType(document) {
    //only if the status code is 200 do we need to really find out what we're serving up.
    var type = 'text/plain';
    if (document.statusCode == 200) {
        switch (path.extname(document.path)) {
            case '.html':
                type = 'text/html';
                break;
            case '.js':
                type = 'text/javascript';
                break;
            case '.css':
                type = 'text/css';
                break;
            case '.png':
                type = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                type = 'image/jpeg';
                break;
            case '.gif':
                type = 'image/gif';
                break;
            case '.ico':
                type = 'image/x-icon';
                break;
            default:
            break;
        }
    }
    return type;
}