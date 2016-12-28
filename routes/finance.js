var express = require('express');
var router = express.Router();

var Finance = require('../models/finance');

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
	res.render('finance/expense', {
		title: 'Expense - '
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
		res.render('finance/view-all',{
			title: 'View All - ',
			results: results
		});
	});
});

router.get('/deleteTransaction/:id', ensureAuthenticated, function(req, res){
	var transactionId = req.params.id;
	Finance.deleteTranscation(transactionId, function(err, results){
		if(err) throw err;
		console.log("Transaction deleted successfully with id - " + transactionId);
		req.flash('success_msg', 'Transaction successfully deleted');
		res.redirect('/finance/view-all');
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