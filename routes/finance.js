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
	var username = req.user.username;
	var category = req.body.category;
	var amount = req.body.amount;
	var type = 'Income';

	// Validation
	req.checkBody('category', 'Category is required').notEmpty();
	req.checkBody('amount', 'Amount is required').notEmpty();
	req.checkBody('amount', 'Amount should contain only numbers').isNumeric();

	var errors = req.validationErrors();

	if(errors){
		res.render('finance/income',{
			title: 'Income - ',
			errors: errors
		});
	} else {
		var newTransaction = new Finance({
			username: username,
			amount: amount,
			category: category,
			type: type
		});

		Finance.createTransaction(newTransaction, function(err, user){
			if(err) throw err;
			console.log(newTransaction);
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
	var username = req.user.username;
	var category = req.body.category;
	var amount = req.body.amount;
	var type = 'Expense';

	// Validation
	req.checkBody('category', 'Category is required').notEmpty();
	req.checkBody('amount', 'Amount is required').notEmpty();
	req.checkBody('amount', 'Amount should contain only numbers').isNumeric();

	var errors = req.validationErrors();

	if(errors){
		res.render('finance/expense',{
			title: 'Expense - ',
			errors: errors
		});
	} else {
		var newTransaction = new Finance({
			username: username,
			amount: amount,
			category: category,
			type: type
		});

		Finance.createTransaction(newTransaction, function(err, transaction){
			if(err) throw err;
			console.log(transaction);
		});

		req.flash('success_msg', 'Expense successfully created');
		res.redirect('/finance/expense');
	}
});

// View All
router.get('/view-all', ensureAuthenticated, function(req, res){
	Finance.getAllTransaction(req.user.username, function(err, results){
		if(err) throw err;
		res.render('finance/view-all',{
			title: 'View All - ',
			results: results
		});
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

function processAllFieldsOfTheForm(request, response, type) {
	var form = new formidable.IncomingForm();
	form.parse(request, function (err, fields, files) {
		insertData(fields, response, type);
	});
}

module.exports = router;