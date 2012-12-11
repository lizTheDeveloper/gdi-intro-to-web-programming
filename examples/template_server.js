var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    _ = require('../node_modules/underscore');

http.createServer(function (request,response) {
    console.log('New Request');
    console.log(request);
    request.querystring = url.parse(request.url, true).query;  //return an object from a querystring with raw name-value pairs.

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

    //TODO: Handle errors.
    request.addListener('close', function() {
        if (!request.ended) {
            request.terminated = true;
            assembleDocument(request, function(document) {
                document.headers = getHeaders(document);
                response.writeHead(document.statusCode, document.headers);
                response.end(document.body);
            });
            return;
        }
    });

}).listen(process.env.PORT);

function assembleDocument(request, callback) {
    var document = {};
    document.path = url.parse(request.url).pathname;
    if (request.terminated) {
        document.statusCode = 500;
        document.body = http.STATUS_CODES[500];
        callback(document);
        return;
    }

    document.body = getBody(request.path, function(document) {
        if (!document.statusCode) {
            document.statusCode = 200;
        }
        callback(document);
    });


}

//returns a body
function getBody(path) {
    switch (document.path) {
        case '/greeting':
            document.body += "Hello " + name + "!";
            document.body += goBack;
            break;
        case '/farewell':
            document.body += "Goodbye, " + name + ". :(";
            document.body += goBack;
            break;
        case '/form':
            document.body += aForm;
            if (request.method == 'POST') {
                document.body += 'Hello, ' + request.form.first_name;
                document.body += request.form.last_name +'! <br>';
            }
            document.body += goBack;
            break;
        default:
            document.readFile = true;
            fs.readFile('.' + url.parse(request.url).pathname, function(err, data) {
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
        switch (parseExt(document.path)) {

            case 'html':
                type = 'text/html';
                break;
            case 'js':
                type = 'text/javascript';
                break;
            case 'css':
                type = 'text/css';
                break;
            case 'png':
                type = 'image/png';
                break;
            case 'jpg':
            case 'jpeg':
                type = 'image/jpeg';
                break;
            case 'gif':
                type = 'image/gif';
                break;
            case 'ico':
                type = 'image/x-icon';
                break;
            default:
            break;
        }
    }
    return type;
}

//This function is very nieve, it just grabs the last dot and returns what's after it.
function parseExt(path) {
    var dot = path.lastIndexOf('.');
    var ext = path.substring(dot + 1);
    //if it's a raw path, assume HTML
    if (dot == -1) { ext = 'html' }
    return ext;
}