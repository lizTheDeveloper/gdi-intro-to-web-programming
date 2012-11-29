
//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
    url = require('url'),
    qs = require('querystring');

// http://nodejs.org/api/url.html - We'll be parsing the querystring with this.

console.log('script running');
var header ='<!doctype html><html><head><title>My Preprocessed App</title></head><body><div class="header"><h1>My Preprocessed Header</h1>';
var aForm = '<form method="POST" action="/form">First Name:<input name="first_name"><br>Last Name:<input name="last_name"><button type="submit">Submit</button></form>';
var goBack ='<a href="/">Go Back Home</a>';
var footer ='</body>';

http.createServer(function (request,response) {
    console.log('server running');
    var formString = '';
    var body ='';
    var responseCode = '';
    var path = url.parse(request.url).pathname;
    var querystring = url.parse(request.url, true).query;  //return an object from a querystring with raw name-value pairs.

    request.addListener('data', function(chunk) {
       //handle a chunk of data, passed in as a buffer.
        console.log('Data');
        formString += chunk.toString();
    });
    request.addListener('end', function() {
        //we're done, now parse the form.
        console.log('end');
        if (request.method == 'POST') {
            request.form = qs.parse(formString);
        }
        request.ended = true;
        body = makeBody(path, querystring, request);
        responseCode = getResponseCode(body);
        response.writeHead(responseCode, {
            'Content-Length': body.length,
            'Content-Type': 'text/html' });
        response.end(body);
    });
    request.addListener('close', function() {
        console.log('close');
        //we're done, now parse the form.
        if (!request.ended) {
            //Request died midway through. Throw an error.
            responseCode = 500;
            body = http.STATUS_CODES[request.responseCode];
            return;
        }
    });




}).listen(process.env.PORT);


function getResponseCode(body) {
    return 200;
}

function makeBody(path, querystring, request) {
    var body = header;
    var name = querystring.name || 'lady';

    if (request.method == "POST") {
        console.log('Its post.');
    }

    switch (path) {
        case '/greeting':
            body += "Hello " + name + "!";
            body += goBack;
            break;
        case '/farewell':
            body += "Goodbye, " + name + ". :(";
            body += goBack;
            break;
        case '/form':
            body += aForm;

            if (request.form) {
                body += 'Hello, ' + request.form.first_name;
                body += request.form.last_name +'! <br>';
            }
            body += goBack;
            break;
        default:
            body += 'Hello! Please click one of the following links: ';
            body += '<ul>'
            body += '<li><a href="/greeting?name=Pamela">Greet Pamela</a></li>';
            body += '<li><a href="/greeting?name=Adria">Greet Adria</a></li>';
            body += '<li><a href="/farewell?name=Liz">Say goodbye to Liz</a></li>';
            body += '<li><a href="/farewell?name=You">Say goodbye to You</a></li>';
            body += '</ul>';
            break;
    }

    body += footer;
    return body;
}