
//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    qs = require('querystring');

//HTML elements to be assembled
var header ='<!doctype html><html><head><title>My Preprocessed App</title></head><body><div class="header"><h1>My Preprocessed Header</h1>';
var aForm = '<form method="POST" action="/form">First Name:<input name="first_name"><br>Last Name:<input name="last_name"><button type="submit">Submit</button></form>';
var goBack ='<a href="/">Go Back Home</a>';
var footer ='</body>';

//The server herself.
http.createServer(function (request,response) {
    console.log('Request received');
    request.form = '';
    var responseCode = '';

    //Parse querystring, since we have the entire thing immediately.
    request.querystring = url.parse(request.url, true).query;  //return an object from a querystring with raw name-value pairs.

    //Because request is an object that was only just created, and only exists in the scope of this server,
    //We're going to add listeners to the events it emits here.

    //This event is emitted when we get a chunk of request body data.
    request.addListener('data', function(chunk) {
        console.log('Data');
        //handle a chunk of data, passed in as a buffer.
        //Buffers are easily transformed to strings.
        request.form += chunk.toString();
    });

    //This event is emitted when we reach the end of the request body.
    //In some cases, we might never reach the end, because the connection is prematurely closed. We want to check for that.
    request.addListener('end', function() {

        console.log('end');
        if (request.method == 'POST') {
            request.form = qs.parse(request.form);
        }
        //Request exists in a higher "scope" than this listener callback.
        //thus, we can use this property to indicate a "state". If we've "ended", it will be true. Otherwise, undefined.
        //This is useful in case a "close" event fires before "end".
        request.ended = true;
        assembleDocument(request, function(document) {
            response.writeHead(document.statusCode, document.headers);
            response.end(document.body);
        });

    });

    request.addListener('close', function() {
        console.log('close');
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
    if (request.terminated){
        document.statusCode = 500;
        document.body = http.STATUS_CODES[500];
    }

    var name = request.querystring.name || 'lady';

    document.body = header;
    switch (url.parse(request.url).pathname) {
        case '/greeting':
            document.body += "Hello " + name + "!";
            document.body += goBack;
            document.type = ''
            break;
        case '/farewell':
            document.body += "Goodbye, " + name + ". :(";
            document.body += goBack;
            document.type = '';
            break;
        case '/form':
            document.body += aForm;
            if (request.method == 'POST') {
                document.body += 'Hello, ' + request.form.first_name;
                document.body += request.form.last_name +'! <br>';
            }
            document.body += goBack;
            document.type = '';
            break;
        default:
            fs.readFile(url.parse(request.url).pathname, function(err, data) {
                if (err) {
                    document.statusCode = 500;
                    document.body = http.STATUS_CODES[500] + '<br>There was an error getting the requested file: ' + err;
                    document.type = 'html/text';
                    console.log(err);
                } else {
                    document.statusCode = 200;
                    document.body = data.toString();
                    document.type = getType(something);
                }
                document.headers = {
                    'Content-Length': document.body.length,
                    'Content-Type': document.type
                }
                callback(document);
                return;
            });
    }
    document.body += footer;
    document.headers = {
        'Content-Length': document.body.length,
        'Content-Type': document.type
    }
    callback(document);
}