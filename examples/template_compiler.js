var _ = require('../node_modules/underscore'),
    events = require('events'),
    path = require('path'),
    fs = require('fs');

//console.log(process.env);
var data = {name:"Ada Lovelace", occupation:"First programmer ever!"};
compileTemplate('./examples/template.template','./examples/body.template', data, function(path) {
    console.log("Read and write complete! File written to:" + path);
});

//Container and Body should both be paths, we'll us using readfile.
//data contains any data we might like to pass to the template.
//callback is what is executed at the end.
function compileTemplate(container, body, data, callback) {
    var compiledPage = new events.EventEmitter();

    compiledPage.addListener('readFile', function() {
        if (compiledPage.containerLoaded === true && compiledPage.bodyLoaded === true) {
            compiledPage.data = {};

            for (var key in data) {
                compiledPage.data[key] = data[key];
            }
            compiledPage.data.body = compiledPage.body;

            var source = _.template(compiledPage.container, compiledPage.data); //Oh look! The point of the exercise!

            var writePath = 'app/' + path.basename(body, '.template') + '.html';
            fs.writeFile(writePath, source, 'utf8', function(err) {
                if (err) throw err;
                console.log('I have written ' + source + ' to ' + writePath);
            });
            callback(writePath);
        }
    });


    //get the container file
    fs.readFile(container, function(err, data) {
        if (err) {
            compiledPage.statusCode = 500;
            compiledPage.container = 'There was an error getting the requested file: ' + err;
            console.log(err);
        } else {
            if (compiledPage.statusCode != 500) {
                compiledPage.statusCode = 200;
                compiledPage.container = data.toString();
            } else {
                compiledPage.container = data.toString();
            }
        }
        compiledPage.containerLoaded = true;
        compiledPage.emit('readFile');
    });


    //get the body file
    fs.readFile(body, function(err, data) {
        if (err) {
            compiledPage.statusCode = 500;
            compiledPage.body = 'There was an error getting the requested file: ' + err;
            console.log(err);
        } else {
            if (compiledPage.statusCode != 500) {
                compiledPage.statusCode = 200;
                compiledPage.body = data.toString();
            } else {
                compiledPage.body = data.toString();
            }
        }
        compiledPage.bodyLoaded = true;
        compiledPage.emit('readFile');
    });
}