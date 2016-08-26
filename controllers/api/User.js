'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var User = require('./../../models/User');
var UserType = require('./../../models/UserType');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('uqZL4CDiBCV4wU7yc5IGmg');

var fs = require('fs'),
	path = require('path'),
	busboy = require('connect-busboy');

router.use(busboy());

router.post('/register-user', function (request, response) {
	UserType.findOne({typeName: 'Normal User'}, function (error, userType) {
		var user = new User({
			username: request.body.username,
			email: request.body.email,
			password: generatePassword(),
			firstName: request.body.firstName,
			lastName: request.body.lastName,
			_userType: userType._id
		});
		
		user.save(function (err) {
			if (err)
				return response.json('{error: ' + err.message + ', responseCode: ' + err.statusCode + '}');
			
			// send an email to the user informing them that the account has been created.
			// sendAutomatedEmail(user.firstName, user.lastName, user.email, user.password);	// Working!! 2016-07-23
		});
		
		return response.json(user).status(201).end();
	});
});

router.post('/addUser', function (request, response) {
	var fstream;
	var filePath;
	var fileName;
	
	var currDate = new Date().getUTCDate().toString();
	var currMonth = new Date().getUTCMonth().toString();
	var currYear = new Date().getUTCFullYear().toString();
	
	var userTypeId;
	var user = new User( {
		_userType: request.body.userType
	});
	
	request.pipe(request.busboy);
	request.busboy.on('file', function (fieldname, file, filename) {
		
		filePath = path.join(__dirname, '../../public/uploads/profiles/', currYear + '-' + currMonth + '-' + currDate + '-' + filename);
		user.profilePic = config.baseUri + 'uploads/profiles/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename;
		
		console.log('{ filePath: ' + filePath + ', fileName: ' + config.baseUri + 'uploads/profiles/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename + ' }');
		
		fstream = fs.createWriteStream(filePath);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log('Photo Uploaded');
		});
	});
	
	// Get values from all the drop down lists and textfields
	request.busboy.on('field', function(key, value) {
		
		if (key.toString() == 'username')
			user.username = value.toString();
		else if (key.toString() == 'email')
			user.email = value.toString();
		else if (key.toString() == "password")
			user.password = value.toString();
		else if(key.toString() == "firstName")
			user.firstName = value.toString();
		else if (key.toString() == "lastName")
			user.lastName = value.toString();
		else if (key.toString() == "userType")
			user._userType = userTypeId = value.toString();
	});
	
	if (user) {
		user.save(function(error) {
			if (error) {
				return response.json({Error: 'Error adding new user record.', OfficialError: error.toString(), dataPassed: user}).status(500).end();
			}
			
			sendAutomatedEmail(user.firstName, user.lastName, user.email, user.password);
			
			UserType.findOne({_id: userTypeId}, function(error, userType) {
				userType._users.push(user);
				userType.save();
			});
		});
	}
	
});

/**
 * The sendAutomatedEmail method will send an email to the target user with instructions of the new account & how to log in.
 * @param firstName The user's First name.
 * @param lastName The user's Last name.
 * @param email The user's Email address.
 * @param password The user's Password.
 */
function sendAutomatedEmail (firstName, lastName, email, password) {
	var message = {
		"html": "<p>Your login password: " + password + "</p>",
		"text": "Your login password is " + password,
		"subject": "TalkDay App User Account Creation",
		"from_email": "shermanchen@telerikcoders.asia",
		"from_name": "Admin TelerikCoders",
		"to": [{
			"email": email,
			"name": firstName + " " + lastName,
			"type": "to"
		}],
		"headers": {
			"Reply-To": "info@telerikcoders.asia"
		},
		"important": false,
		"track_opens": null,
		"track_clicks": null,
		"auto_text": null,
		"auto_html": null,
		"inline_css": null,
		"url_strip_qs": null,
		"preserve_recipients": null,
		"view_content_link": null,
		"bcc_address": null,
		"tracking_domain": null,
		"signing_domain": null,
		"return_path_domain": null,
		"merge": true,
		"merge_language": "mailchimp",
		"global_merge_vars": [],
		"merge_vars": [],
		"tags": [
			"User Account Creation"
		]
	};
	var async = false;
	var ip_pool = "Main Pool";
	var send_at = "example send_at";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": new Date()}, function(result) {
		console.log(result);
		/*
		 [{
		 "email": "recipient.email@example.com",
		 "status": "sent",
		 "reject_reason": "hard-bounce",
		 "_id": "abc123abc123abc123abc123abc123"
		 }]
		 */
	}, function(e) {
		// Mandrill returns the error as an object with name and message keys
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		// A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}

function generatePassword() {
	var length = 8,
		charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		retVal = "";
	for (var i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return retVal;
}

module.exports = router;