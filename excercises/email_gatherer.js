
//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring');

//HTML elements to be assembled
var header ='<!doctype html><html><head><title>My app</title></head><body><div class="header"><h1>Title</h1>';
var aForm = '<form method="POST" action="/form">First Name:<input name="first_name"><br>Last Name:<input name="last_name"><button type="submit">Submit</button></form>';
var goBack ='<a href="/">Go Back Home</a>';
var footer ='</body>';

//The server herself.
http.createServer(function (request,response) {
    //We're going to begin by adding things to the request object.


    //Parse querystring, since we have the entire thing immediately.
    request.querystring = url.parse(request.url, true).query;  //return an object from a querystring with raw name-value pairs.

    //Because request is an object that was only just created, and only exists in the scope of this server,
    //We're going to add listeners to the events it emits here.

    //This event is emitted when we get a chunk of request body data.
    request.addListener('data', function(chunk) {
        //handle a chunk of data, passed in as a buffer.
        //Buffers are easily transformed to strings.
        request.form += chunk.toString();
    });

    //This event is emitted when we reach the end of the request body.
    //In some cases, we might never reach the end, because the connection is prematurely closed. We want to check for that.
    request.addListener('end', function() {

        if (request.method == 'POST') {
            request.form = qs.parse(request.form);
        }
        //Request exists in a higher "scope" than this listener callback.
        //thus, we can use this property to indicate a "state". If we've "ended", it will be true. Otherwise, undefined.
        //This is useful in case a "close" event fires before "end".
        request.ended = true;
        assembleDocument(request, function(document) {
            document.headers = getHeaders(document);
            response.writeHead(document.statusCode, document.headers);
            response.end(document.body);
        });

    });

    //This event is emitted when the connection is closed.
    request.addListener('close', function() {
        //Checking for an edge case, in this case, we didn't get the entire message.
        if (!request.ended) {
            //Request died midway through. Throw an error.
            request.terminated = true;
            return;
        }
    });

}).listen(process.env.PORT);


//this will return a document object with a body and some headers.
function assembleDocument(request, callback) {
    var document = {};
    document.path = url.parse(request.url).pathname;
    if (request.terminated){
        document.statusCode = 500;
        document.body = http.STATUS_CODES[500];
        callback(document);
    }

    var name = request.querystring.name || 'lady';

    document.body = header;
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
    if (!document.readFile) {
        document.statusCode = 200;
        document.body += footer;
        callback(document);
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
        switch (path.extname(document.path)) {

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