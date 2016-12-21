var cool = require('cool-ascii-faces');
var express = require('express');
var fs = require('fs');
var app = express();
var formidable = require("formidable");
var util = require('util');

var mongodb = require('mongodb');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

app.get('/test', function(request, response) {
	displayForm(response);
});

app.post('/test', function(request, response) {
	processAllFieldsOfTheForm(request, response);
});

function displayForm(response) {
    //response.render('pages/forms');
    fs.readFile('form.html', function (err, data) {
        response.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        response.write(data);
        response.end();
    });
}

function processAllFieldsOfTheForm(request, response) {
    var form = new formidable.IncomingForm();

    form.parse(request, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        response.writeHead(200, {
            'content-type': 'text/plain'
        });
        response.write('received the data:\n\n');
        response.end(util.inspect({
            fields: fields
        }));
    });
}

app.get('/thelist', function(request, response){
 
  // Get a Mongo client to work with the Mongo server
  var MongoClient = mongodb.MongoClient;
 
  // Define where the MongoDB server is
  var url = 'mongodb://test:test@ds141108.mlab.com:41108/heroku_w4v89h8f';
 
  // Connect to the server
  MongoClient.connect(url, function (err, db) {
  if (err) {
    response.send('Unable to connect to the Server', err);
  } else {
    // We are connected
    //response.send('Connection established');
 
    // Get the documents collection
    var collection = db.collection('income');
 
    // Find all students
    collection.find({}).toArray(function (err, result) {
      if (err) {
        response.send(err);
      } else if (result.length) {
            response.send(result);
      } else {
        response.send('No documents found');
      }
      //Close connection
      db.close();
    });
  }
  });
});