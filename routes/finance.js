var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');

var Finance = require('../models/finance');
var ExpenseType = require('../models/expensetype');

var formidable = require('formidable');

var fs = require('fs');
var parse = require('csv-parse');

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Income
router.get('/income', ensureAuthenticated, function(req, res){
	res.render('finance/income', {
		title: 'Income - '
	});
});

router.post('/income', ensureAuthenticated, function(req, res){
	var user_id = req.user.id;
	var category = req.body.category;
	var amount = req.body.amount;
	var type = 'Income';
	var dateOfTransaction = req.body.date;

	// Validation
	check('category', 'Category is required').not().isEmpty();
	check('amount', 'Amount is required').not().isEmpty();
	check('amount', 'Amount should be in currency format').isCurrency();
	check('date', 'Date of transaction is required').not().isEmpty();

	var errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.render('finance/income',{
			title: 'Income - ',
			errors: errors
		});
	} else {
		var newTransaction = new Finance({
			user_id: user_id,
			amount: amount,
			category: category,
			type: type,
			dateOfTransaction: dateOfTransaction
		});

		Finance.createTransaction(newTransaction, function(err, user){
			if(err) throw err;
			console.log("Transaction created successfully with id - " + newTransaction.id);
		});

		req.flash('success_msg', 'Income successfully created');
		res.redirect('/finance/income');
	}
});

// Expense
router.get('/expense', ensureAuthenticated, function(req, res){
	ExpenseType.getAllExpenseTypeForUser(req.user.id, function(err, expenseTypes){
		if(err) throw err;
		res.render('finance/expense', {
			title: 'Expense - ',
			expenseTypes: expenseTypes
		});
	});
});

router.post('/expense', ensureAuthenticated, function(req, res){

	var user_id = req.user.id;
	var category = req.body.category;
	var amount = req.body.amount;
	var type = 'Expense';
	var dateOfTransaction = req.body.date;

	// Validation
	check('category', 'Category is required').not().isEmpty();
	check('amount', 'Amount is required').not().isEmpty();
	check('amount', 'Amount should be in currency format').isCurrency();
	check('date', 'Date of transaction is required').not().isEmpty();

	var errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.render('finance/expense',{
			title: 'Expense - ',
			errors: errors
		});
	} else {
		var newTransaction = new Finance({
			user_id: user_id,
			amount: amount,
			category: category,
			type: type,
			dateOfTransaction: dateOfTransaction
		});

		Finance.createTransaction(newTransaction, function(err, transaction){
			if(err) throw err;
			console.log("Transaction created successfully with id - " + newTransaction.id);
		});

		req.flash('success_msg', 'Expense successfully created');
		res.redirect('/finance/expense');
	}
});

router.get('/expense-upload', ensureAuthenticated, function(req, res){
	res.render('finance/expense-uploader', {
		title: 'Expense Uploader - '
	});
});

router.post('/expense-upload', ensureAuthenticated, function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var path = files.filetoupload.path;
		var parser = parse({delimiter: ','}, function (err, data) {
		    data.forEach(function(line) {
			    var user_id = req.user.id;
				var category = line[1];
				var amount = line[2];
				var type = 'Expense';
				var dateOfTransaction = line[0];

				var newTransaction = new Finance({
					user_id: user_id,
					amount: amount,
					category: category,
					type: type,
					dateOfTransaction: dateOfTransaction
				});

				Finance.createTransaction(newTransaction, function(err, transaction){
					if(err) throw err;
					console.log("Transaction created successfully with id - " + newTransaction.id);
				});
		    });    
		});
		// read the inputFile, feed the contents to the parser
		fs.createReadStream(path).pipe(parser);
		req.flash('success_msg', 'Expense(s) successfully created');
		res.redirect('/finance/expense-upload');
	});
});

router.get('/income-upload', ensureAuthenticated, function(req, res){
	res.render('finance/income-uploader', {
		title: 'Income Uploader - '
	});
});

router.post('/income-upload', ensureAuthenticated, function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var path = files.filetoupload.path;
		var parser = parse({delimiter: ','}, function (err, data) {
			data.forEach(function(line) {
				var user_id = req.user.id;
				var category = line[1];
				var amount = line[2];
				var type = 'Income';
				var dateOfTransaction = line[0];

				var newTransaction = new Finance({
					user_id: user_id,
					amount: amount,
					category: category,
					type: type,
					dateOfTransaction: dateOfTransaction
				});

				Finance.createTransaction(newTransaction, function(err, transaction){
					if(err) throw err;
					console.log("Transaction created successfully with id - " + newTransaction.id);
				});
			});
		});
		// read the inputFile, feed the contents to the parser
		fs.createReadStream(path).pipe(parser);
		req.flash('success_msg', 'Income(s) successfully created');
		res.redirect('/finance/income-upload');
	});
});


// View All
router.get('/view-all', ensureAuthenticated, function(req, res){
	Finance.getAllTransactionForUser(req.user.id, req.query.year, function(err, results){
		if(err) throw err;
		var processedResults = {};
		for (var i = 0; i < results.length; i++) {
			var dateOfTransaction = new Date(results[i].dateOfTransaction);
			var year = dateOfTransaction.getFullYear();
			var month = monthNames[dateOfTransaction.getMonth()];
			var key = month+ " " +year;
			if(key in processedResults) {
				var transactionsForMonth = processedResults[key];
				transactionsForMonth.push(results[i]);
				processedResults[key] = transactionsForMonth;
			} else {
				var transactionsForMonth = [results[i]];
				processedResults[key] = transactionsForMonth;
			}
		}
		res.render('finance/view-all',{
			title: 'View All - ',
			results: processedResults
		});
	});
});

// View All Consolidated
router.get('/view-all-consolidated', ensureAuthenticated, function(req, res) {
	var expenseTypes = [];
	ExpenseType.getAllExpenseTypeForUser(req.user.id, function(err, results){
		if(err) throw err;
		for (var i = 0; i < results.length; i++) {
			expenseTypes[i] = results[i].expenseType;
		}
	});

	Finance.getAllTransactionForUser(req.user.id, req.query.year, function(err, results){
		if(err) throw err;
		var processedResults = {};
		var dataForGraph = [];
		var dataForTable = [];
		var months = []; 
		var categories = [];

		for (var i = 0; i < results.length; i++) {
			var dateOfTransaction = new Date(results[i].dateOfTransaction);
			var year = dateOfTransaction.getFullYear();
			var month = monthNames[dateOfTransaction.getMonth()];
			var monthYear = month+ " " +year;
			var type = results[i].type;
			var category = results[i].category;
			
			var monthIndex = months.indexOf(monthYear);
			if(monthIndex == -1) {
				months.push(monthYear);
				monthIndex = months.indexOf(monthYear);
			}
			var catIndex = expenseTypes.indexOf(category);

			var categoryIndex = categories.indexOf(category);
			if(catIndex != -1 && categoryIndex == -1) {
				categories.push(category);
				categoryIndex = categories.indexOf(category);
			}
			
			// Build data for graph
			if(type != "Income" && results[i].amount < "1300" && catIndex != "-1") {
				if(monthIndex in dataForGraph) {
					var transactionsForMonth = dataForGraph[monthIndex];
					if(categoryIndex in transactionsForMonth) {
						var categoryTotal = transactionsForMonth[categoryIndex];
						categoryTotal = categoryTotal + results[i].amount;
						transactionsForMonth[categoryIndex] = categoryTotal;
					} else {
						transactionsForMonth[categoryIndex] = results[i].amount;
					}
					dataForGraph[monthIndex] = transactionsForMonth;
				} else {
					var transactionsForMonth = {};
					transactionsForMonth[categoryIndex] = results[i].amount;
					dataForGraph[monthIndex] = transactionsForMonth;
				}
			}
			

			// Build data for table
			if(categoryIndex in dataForTable) {
				var transactionsForCategory = dataForTable[categoryIndex];
				if(monthIndex in transactionsForCategory) {
					var categoryTotal = transactionsForCategory[monthIndex];
					categoryTotal = categoryTotal + results[i].amount;
					transactionsForCategory[monthIndex] = categoryTotal;
				} else {
					transactionsForCategory[monthIndex] = results[i].amount;
				}
				dataForTable[categoryIndex] = transactionsForCategory;
			} else {
				var transactionsForCategory = {};
				transactionsForCategory[monthIndex] = results[i].amount;
				dataForTable[categoryIndex] = transactionsForCategory;
			}
		}

		//console.log(JSON.stringify(dataForGraph));
		//console.log(JSON.stringify(dataForTable));

		// Filling empty values in map
		for (var i = 0; i < dataForGraph.length; i++) {
			var transactionsForMonth = dataForGraph[i];
			for (var j = 0; j < categories.length; j++) {
				if(!(j in transactionsForMonth)) {
					transactionsForMonth[j] = 0.0;
				}
			}
			dataForGraph[i] = transactionsForMonth;
		}

		// Filling empty values in map
		for (var i = 0; i < dataForTable.length; i++) {
			var transactionsForCategory = dataForTable[i];
			for (var j = 0; j < months.length; j++) {
				if(!(j in transactionsForCategory)) {
					transactionsForCategory[j] = 0.0;
				}
			}
			dataForTable[i] = transactionsForCategory;
		}

		res.render('finance/view-all-consolidated',{
			title: 'View All Consolidated - ',
			dataForGraph: dataForGraph,
			dataForTable: dataForTable,
			months: months,
			categories: categories
		});
	});
});

// View All Summary
router.get('/view-all-summary', ensureAuthenticated, function(req, res){
	Finance.getAllTransactionForUser(req.user.id, req.query.year, function(err, results){
		if(err) throw err;
		var processedExpenses = {};
		var processedIncome = {};
		for (var i = 0; i < results.length; i++) {
			var type = results[i].type;
			var category = results[i].category;

			if(type == "Income") {
				if(category in processedIncome) {
					var categoryTotal = processedIncome[category];
					categoryTotal = categoryTotal + results[i].amount;
					processedIncome[category] = categoryTotal;
				} else {
					var categoryTotal = results[i].amount;
					processedIncome[category] = categoryTotal;
				}
			} else {
				if(category in processedExpenses) {
					var categoryTotal = processedExpenses[category];
					categoryTotal = categoryTotal + results[i].amount;
					processedExpenses[category] = categoryTotal;
				} else {
					var categoryTotal = results[i].amount;
					processedExpenses[category] = categoryTotal;
				}
			}
		}

		// Sorting the results
		var newArr = [];
		for (var key in processedExpenses) {
		  newArr.push({
		        key: key,
		        val: processedExpenses[key]
		    });
		}
		newArr.sort(function(a, b) {
		  return b.val - a.val;
		});
		var sortedExpenses = {};
		for (var i = 0; i < newArr.length; i++) {
		    sortedExpenses[newArr[i].key] = newArr[i].val;
		}

		res.render('finance/view-all-summary',{
			title: 'View All Summary - ',
			processedIncome: processedIncome,
			sortedExpenses: sortedExpenses
		});
	});
});

// Delete Transaction
router.get('/deleteTransaction/:id', ensureAuthenticated, function(req, res){
	var transactionId = req.params.id;
	var currentYear = (new Date()).getFullYear();
	Finance.deleteTranscation(transactionId, function(err, results){
		if(err) throw err;
		console.log("Transaction deleted successfully with id - " + transactionId);
		req.flash('success_msg', 'Transaction successfully deleted');
		res.redirect('/finance/view-all?year='+currentYear);
	});
});

// ExpenseType
router.get('/expenseType', ensureAuthenticated, function(req, res){
	ExpenseType.getAllExpenseTypeForUser(req.user.id, function(err, results){
		if(err) throw err;
		res.render('finance/expensetype',{
			title: 'View All Expense Types - ',
			results: results
		});
	});
});

// Create new Expense Type
router.post('/expenseType', ensureAuthenticated, function(req, res){
	var user_id = req.user.id;
	var expenseType = req.body.expenseType;

	// Validation
	check('expenseType', 'Expense Type is required').not().isEmpty();
	var errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('finance/expensetype',{
			title: 'Expense Type - ',
			errors: errors
		});
	} else {
		var newExpenseType = new ExpenseType({
			user_id: user_id,
			expenseType: expenseType
		});

		ExpenseType.createExpenseType(newExpenseType, function(err, expenseType){
			if(err) throw err;
			console.log("Expense Type created successfully with id - " + newExpenseType.id);
		});

		req.flash('success_msg', 'Expense type successfully created');
		res.redirect('/finance/expenseType');
	}
});

// Delete Expense Type
router.get('/deleteExpenseType/:id', ensureAuthenticated, function(req, res){
	var expenseTypeId = req.params.id;
	ExpenseType.deleteExpenseType(expenseTypeId, function(err, results){
		if(err) throw err;
		console.log("Expense Type deleted successfully with id - " + expenseTypeId);
		req.flash('success_msg', 'Expense Type successfully deleted');
		res.redirect('/finance/expenseType');
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;
