'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var User = require('./../../models/User');

router.get('/login', function (request, response) {
	response.render('user/login', {
		title: 'Administrator Login',
		baseUri: config.baseUri
	});
});

router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'user/list', {
				title: 'User Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'user/list', {
				title: 'User Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.resetpwd) {
			response.render ( 'user/list', {
				title: 'User Listing',
				baseUri: config.baseUri,
				show_info: 'Password Reset.',
				username: request.query.username,
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'user/list', {
				title: 'User Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
		
	}
	else {
		response.redirect('/users/login');
	}
});

router.get('/create', function (request, response) {
	if (request.cookies.fullname) {
		if (request.query.error) {
			response.render('user/create', {
				title: 'Add New User',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname,
				show_error: 'Error occured'
			});
		}
		else if (request.query.created) {
			response.render('user/create', {
				title: 'Add New User',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname,
				show_info: 'Record created'
			});
		}
		else
		{
			response.render('user/create', {
				title: 'Add New User',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname,
			});
		}
	}
	else {
		response.redirect('/users/login');
	}
});

router.get('/edit', function (request, response) {
	if (request.cookies.fullname) {
		User.findOne({_id: request.query.id}).populate('_userType').exec(function(error, userDetails) {
			if (request.query.error) {
				response.render('user/edit', {
					title: 'Edit User',
					baseUri: config.baseUri,
					fullname: request.cookies.fullname,
					show_error: 'Error occured',
					user: userDetails
				});
			}
			else if (request.query.updated) {
				response.render('user/edit', {
					title: 'Edit User',
					baseUri: config.baseUri,
					fullname: request.cookies.fullname,
					show_info: 'Record Updated',
					user: userDetails
				});
			}
			else
			{
				response.render('user/edit', {
					title: 'Edit User',
					baseUri: config.baseUri,
					fullname: request.cookies.fullname,
					user: userDetails
				});
			}
		});
		
	}
	else {
		response.redirect('/users/login');
	}
});

module.exports = router;