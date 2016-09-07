/**
 * The UserType.js controller will contain methods for creating new User Types and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 7:03pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var User = require('./../../models/User');
var UserType = require('./../../models/UserType');

router.get('/get_list_selection', function(request, response) {
	UserType.find({}, function(error, userTypes) {
		return response.json(userTypes).status(200).end();
	});
});

router.post('/create_user_type', function (request, response) {
	var userType = new UserType({
		typeName: request.body.typeName
	});
	
	userType.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/userTypes/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(userType).status(201).end();
		else
			response.redirect('/userTypes/create/?created=1');
	});
});

module.exports = router;