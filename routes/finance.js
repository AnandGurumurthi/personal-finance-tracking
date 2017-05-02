var express = require('express');
var router = express.Router();

var Finance = require('../models/finance');
var ExpenseType = require('../models/expensetype');

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
	req.checkBody('category', 'Category is required').notEmpty();
	req.checkBody('amount', 'Amount is required').notEmpty();
	req.checkBody('amount', 'Amount should be in currency format').isCurrency();
	req.checkBody('date', 'Date of transaction is required').notEmpty();
	req.checkBody('date', 'Date of transaction should be of date format (mm/dd/yyyy)').isDate();

	var errors = req.validationErrors();

	if(errors){
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
	req.checkBody('category', 'Category is required').notEmpty();
	req.checkBody('amount', 'Amount is required').notEmpty();
	req.checkBody('amount', 'Amount should be in currency format').isCurrency();
	req.checkBody('date', 'Date of transaction is required').notEmpty();
	req.checkBody('date', 'Date of transaction should be of date format (mm/dd/yyyy)').isDate();

	var errors = req.validationErrors();

	if(errors){
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

// View All
router.get('/view-all', ensureAuthenticated, function(req, res){
	Finance.getAllTransactionForUser(req.user.id, function(err, results){
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

// Delete Transaction
router.get('/deleteTransaction/:id', ensureAuthenticated, function(req, res){
	var transactionId = req.params.id;
	Finance.deleteTranscation(transactionId, function(err, results){
		if(err) throw err;
		console.log("Transaction deleted successfully with id - " + transactionId);
		req.flash('success_msg', 'Transaction successfully deleted');
		res.redirect('/finance/view-all');
	});
});

// ExpenseType
router.get('/expenseType', ensureAuthenticated, function(req, res){
	console.log("Inside get method");
	ExpenseType.getAllExpenseTypeForUser(req.user.id, function(err, results){
		if(err) {
			console.log("Error - " + err);
			throw err;
		}
		res.render('finance/expenseType',{
			title: 'View All Expense Types - ',
			results: results
		});
	});
});

// Create new Expense Type
router.post('/expenseType', ensureAuthenticated, function(req, res){
	console.log("Inside post method");
	var user_id = req.user.id;
	var expenseType = req.body.expenseType;

	// Validation
	req.checkBody('expenseType', 'Expense Type is required').notEmpty();
	
	var errors = req.validationErrors();

	if(errors){
		res.render('finance/expenseType',{
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