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

router.get('/create', function (request, response) {
	if (request.query.error) {
		response.render('user/create', {
			title: 'Add New User',
			baseUri: config.baseUri,
			//username: request.cookies.username,
			show_error: 'Error occured'
		});
	}
	else if (request.query.created) {
		response.render('user/create', {
			title: 'Add New User',
			baseUri: config.baseUri,
			//username: request.cookies.username,
			show_info: 'Record created'
		});
	}
	else
	{
		response.render('user/create', {
			title: 'Add New User',
			baseUri: config.baseUri
			//username: request.cookies.username,
		});
	}
});

module.exports = router;