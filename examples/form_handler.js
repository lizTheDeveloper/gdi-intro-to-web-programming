//These are node modules. They allow you to use node.js's APIs
var http = require('http'),
    url = require('url');

// http://nodejs.org/api/url.html - We'll be parsing the querystring with this.

console.log('script running');


http.createServer(function (request,responder) {
    console.log('server running');
    //Recieved request start - begin listening for more data.
    request.addListener('data', function(chunk) {
       //handle a chunk of data, passed in as a buffer.
        request.formString += chunk.toString();
    });
    request.addListener('end', function() {
        //we're done, now parse the form.
        console.log(request.form);
    });
    request.addListener('close', function() {
        //we're done, now parse the form.
        console.log(request);
    });

    var response = getResponse(request);

    responder.writehead(response.code, response.header);
    responder.write()

}).listen(process.env.PORT);


function getResponse(request) {
    var path = url.parse(request.url).pathname;
    var method = request.method;
    var querystring = url.parse(request.url, true).query;

    if (request.method == 'POST') {
        request.
    } else {
        request.form == null;
    }

}



var header ='<!doctype html><html><head><title>My Preprocessed App</title></head><body><div class="header"><h1>My Preprocessed Header</h1>';
var goBack ='<a href="/">Go Back Home</a>';
var footer ='</body>';

function makeBody(path, querystring) {
    var body = header;
    var name = querystring.name || 'lady';

    switch (path) {
        case '/greeting':
            body += "Hello " + name + "!";
            body += goBack;
            break;
        case '/farewell':
            body += "Goodbye, " + name + ". :(";
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