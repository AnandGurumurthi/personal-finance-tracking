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

app.get('/addExpense', function(request, response) {
  response.render('pages/expense');
});

app.post('/addExpense', function(request, response) {
  processAllFieldsOfTheForm(request, response, "expense");
});

app.get('/addIncome', function(request, response) {
  response.render('pages/income');
});

app.post('/addIncome', function(request, response) {
  processAllFieldsOfTheForm(request, response, "income");
});

function processAllFieldsOfTheForm(request, response, type) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        insertData(fields, response, type);
    });
}

function insertData(fields, response, type) {
  console.log(fields);
  var status = true;
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://test:test@ds141108.mlab.com:41108/heroku_w4v89h8f';
  MongoClient.connect(url, function (err, db) {
      if (err) {
        response.send('Unable to connect to the Server', err);
    } else {
        var collection = db.collection('finance');
        collection.insert(fields, function(err, result) {
            if (err) {
                status = false;
            }
        //Close connection
        db.close();
    });
    }
  });
  if(type == 'income') {
    response.render('pages/income', {
        result: status
    });
  } else {
    response.render('pages/expense', {
        result: status
    });
  }
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
        } else {
            response.render('pages/list', {
                results: result
            });
        } 
        //Close connection
        db.close();
      });
    }
  });
});