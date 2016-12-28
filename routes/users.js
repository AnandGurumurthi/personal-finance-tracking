var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('users/register', {
		title: 'Register - '
	});
});

// Login
router.get('/login', function(req, res){
	res.render('users/login', {
		title: 'Login - '
	});
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	var existingUserError = null;

	User.getUserByEmail(email, function(err, user){
		if(user){
			existingUserError = "Email address already registered";
		}

		if(errors || existingUserError){
			res.render('users/register',{
				errors:errors,
				existingUserError:existingUserError
			});
		} else {
			var newUser = new User({
				name: name,
				email:email,
				password: password
			});

			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log("New user created successfully with id - " + newUser.id);
			});

			req.flash('success_msg', 'You are registered and can now login');
			res.redirect('/users/login');
		}
	});
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByEmail(username, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown User'});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: 'Invalid password'});
				}
			});
		});
	}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;