var cool = require('cool-ascii-faces');
var express = require('express');
var fs = require('fs');
var app = express();
var formidable = require("formidable");
var mongodb = require('mongodb');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/add', function(request, response) {
  response.render('pages/form');
});

app.post('/add', function(request, response) {
  processAllFieldsOfTheForm(request, response);
});

function processAllFieldsOfTheForm(request, response) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        insertExpense(fields, response);
    });
}

function insertExpense(fields, response) {

  console.log(fields);
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://test:test@ds141108.mlab.com:41108/heroku_w4v89h8f';
  MongoClient.connect(url, function (err, db) {
      if (err) {
        response.send('Unable to connect to the Server', err);
    } else {
        var collection = db.collection('finance');
        collection.insert(fields, function(err, result) {
          if (err) {
            response.render('pages/form', {
                err: err
            });
        } else {
            response.render('pages/form', {
                success: "success"
            });
        }
      //Close connection
      db.close();
  });
    }
});
}

app.get('/list', function(request, response){

  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://test:test@ds141108.mlab.com:41108/heroku_w4v89h8f';
  MongoClient.connect(url, function (err, db) {
      if (err) {
        response.send('Unable to connect to the Server', err);
    } else {
    var collection = db.collection('finance');
    collection.find({}).toArray(function (err, result) {
      if (err) {
        response.send(err);
    } else if (result.length) {
        response.render('pages/list', {
            results: result
        });
    } else {
        response.send('No documents found');
    }
    //Close connection
    db.close();
  });
}
});
});