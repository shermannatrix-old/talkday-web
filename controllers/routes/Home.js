'use strict';

const express = require('express');
const router = express.Router();
const config = require('./../../config/config');

router.get('/', function (request, response, next) {
	response.redirect('/dashboard');
});

router.get('/dashboard', function (request, response, next) {
	if (request.cookies.username) {
		response.render('home/dashboard', {
			title: 'Dashboard',
			fullname: request.cookies.fullname,
			userAccess: request.cookies.userAccess,
			baseUri: config.baseUri
		});
	}
	else {
		response.render('user/login', {
			title: 'Administrator Login',
			baseUri: config.baseUri
		});
	}
});

module.exports = router;