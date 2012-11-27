var fs = require('fs');
var path = 'examples/exampleFile.txt';
var newData = 'File Overwritten!';

fs.readFile(path, function(err, data) {
    console.log(err);
    var file = data.toString();
    console.log('I am done reading files! It looks like this: ' + file);
});

fs.writeFile(path, newData, 'utf8', function(err) {
    console.log(err);
    console.log('I have written ' + newData + ' to the file');
});

