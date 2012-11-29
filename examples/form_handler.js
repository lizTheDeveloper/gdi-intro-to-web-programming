
//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
    url = require('url');

// http://nodejs.org/api/url.html - We'll be parsing the querystring with this.

console.log('script running');
var header ='<!doctype html><html><head><title>My Preprocessed App</title></head><body><div class="header"><h1>My Preprocessed Header</h1>';
var aForm = '<form method="POST" action="/form">First Name:<input name="first_name"><br>Last Name:<input name="last_name"><button type="submit"></form>';
var goBack ='<a href="/">Go Back Home</a>';
var footer ='</body>';

http.createServer(function (request,response) {
    console.log('server running');
    var path = url.parse(request.url).pathname;
    var querystring = url.parse(request.url, true).query;  //return an object from a querystring with raw name-value pairs.

    request.addListener('data', function(chunk) {
       //handle a chunk of data, passed in as a buffer.
        request.formString += chunk.toString();
        console.log(request.formString);
    });
    request.addListener('end', function() {
        //we're done, now parse the form.
        console.log(request.form);
    });
    request.addListener('close', function() {
        //we're done, now parse the form.
        console.log(request);
    });

    var body = makeBody(path, querystring, request);
    response.writeHead(200, {
    'Content-Length': body.length,
    'Content-Type': 'text/html' });
    response.end(body);
}).listen(process.env.PORT);




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