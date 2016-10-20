/**
 * The User.js controller will contain methods for creating new Users and also retrieving those values for listing purposes. This controller will also
 * container method for login, forget password purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 7:00pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var assert = require('assert');

var config = require('./../../config/config');
var User = require('./../../models/User');
var UserType = require('./../../models/UserType');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('uqZL4CDiBCV4wU7yc5IGmg');

var fs = require('fs'),
	path = require('path'),
	busboy = require('connect-busboy');

router.use(busboy());

router.get('/get_all_users', function (request, response) {
	User.find({ }).populate('_userType _feedbacks _userPosts _userEventRsvps').then(function(users) {
		return response.json(users).status(200).end();
	}, function (error) {
		if ( error ) {
			if ( request.query.mobile ) {
				return response.json ( { Error: error.toString (), ErrorStack: JSON.stringify ( error.stack ) } ).status ( 500 ).end ();
			}
			else {
				response.redirect ( '/users/login?error=1' );
			}
		}
	});
});

router.get('/get_user_details', function (request, response) {
	User.findOne({ username: request.body.username }).populate('_userType').exec(function(error, userDetails) {
		if ( error ) {
			if ( request.query.mobile ) {
				return response.json ( { Error: error.toString (), ErrorStack: JSON.stringify ( error.stack ) } ).status ( 500 ).end ();
			}
			else {
				response.redirect ( '/users/login?error=1' );
			}
		}
		
		return response.json(userDetails).status(200).end();
	});
});

router.get('/reset_password', function (request, response) {
	var modeType = request.query.mode;
	
	User.findOne({ _id: request.query.id }).populate('_userType').exec(function(error, userDetails) {
		if ( error ) {
			if ( request.query.mobile ) {
				return response.json ( { Error: error.toString (), ErrorStack: JSON.stringify ( error.stack ) } ).status ( 500 ).end ();
			}
			else {
				response.redirect ( '/users/login?error=1' );
			}
		}
		
		userDetails.password = generatePassword();
		userDetails.save();
		
		// Notify user of the successful resetting of password.
		// sendAutomatedEmail(user.firstName, user.lastName, user.email, user.password);
		
		if (modeType != 'cms')
			return response.json(userDetails).status(200).end();
		else
			response.redirect('/users/list/?resetpwd=1&username=' + userDetails.username);
	});
});

/**
 * /get_userdetails - this API will retrieve all the details of a single user document.
 * Http Method		: GET
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-28 02:38pm
 */
router.get('/get_userdetails', function (request, response) {
	User.findOne({ username: request.query.username }).populate('_userType').then(function(userDetails) {
		return response.json(userDetails).status(200).end();
	}, function (error) {
		if ( error ) {
			if ( request.query.mobile ) {
				return response.json ( { Error: error.toString (), ErrorStack: JSON.stringify ( error.stack ) } ).status ( 500 ).end ();
			}
			else {
				response.redirect ( '/users/login?error=1' );
			}
		}
	});
});

router.post('/login', function (request, response) {
	User.findOne({ username: request.body.username }).populate('_userType').then(function(userDetails) {
		
		console.log('Password: ' + request.body.password);
		
		var days = 5;
		
		if (userDetails.password === request.body.password) {
			response.cookie('username', userDetails.username, { maxAge: (days*24*60*60*1000) });
			response.cookie('fullname', userDetails.firstName + ' ' + userDetails.lastName, { maxAge: (days*24*60*60*1000) });
			response.cookie('userAccess', userDetails._userType.typeName, { maxAge: (days*24*60*60*1000) });
			
			response.redirect('/dashboard');
		}
		else
		{
			response.render('user/login', {
				title: 'Admin Login',
				error: 'Non-matching password'
			});
		}
	}, function (error) {
		if ( error ) {
			if ( request.query.mobile ) {
				return response.json ( { Error: error.toString (), ErrorStack: JSON.stringify ( error.stack ) } ).status ( 500 ).end ();
			}
			else {
				response.redirect ( '/users/login?error=1' );
			}
		}
	});
});

router.post('/register_user', function (request, response) {
	UserType.findOne({typeName: 'Normal User'}, function (error, userType) {
		var user = new User({
			username: request.body.username,
			email: request.body.email,
			password: generatePassword(),
			firstName: request.body.firstName,
			lastName: request.body.lastName,
			mobileNo: request.body.mobileNo,
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

router.post('/update_mobile_token', function (request, response) {
	User.findOne({_id: request.query.id}, function (error, userDetails) {
		userDetails.mobileToken = request.body.mobileToken;
		
		userDetails.save();
		
		if (request.query.mobile)
			return response.json(userDetails).status(200).end();
		else
			response.redirect('/users/update_mobile_token/?updated=1&id=' + request.query.id);
	});
});

router.post('/add_user', function (request, response) {
	var modeType = request.query.mode;
	
	var userTypeId;
	var userDetails = new User({
		password: generatePassword()
	});
	
	var fstream;
	var filePath;
	var fileName;
	
	var today = new Date();
	var currDate = new Date(today.setHours(today.getHours() + 8)).getDate().toString();
	var currMonth = new Date(today.setHours(today.getHours() + 8)).getMonth().toString();
	var currYear = new Date(today.setHours(today.getHours() + 8)).getFullYear().toString();
	var currHour = new Date(today.setHours(today.getHours() + 8)).getHours().toString();
	var currMin = new Date(today.setHours(today.getHours() + 8)).getMinutes().toString();
	
	request.pipe(request.busboy);
	request.busboy.on('file', function (fieldName, file, filename) {
		
		filePath = path.join(__dirname, '../../public/uploads/profiles/', currYear + '-' + currMonth + '-' + currDate + '-' + currHour + currMin + '-' + filename);
		userDetails.profilePic = '/uploads/profiles/' + currYear + '-' + currMonth + '-' + currDate + '-' + currHour + currMin + '-' + filename;
		
		console.log('{ filePath: ' + filePath + ', fileName: ' + config.baseUri + '/uploads/profiles/' + currYear + '-' + currMonth + '-' + currDate + '-' + currHour + currMin + '-' + filename + ' }');
		
		fstream = fs.createWriteStream(filePath);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log('Photo Uploaded');
		});
	});
	
	// Get values from all the drop down lists and textfields
	request.busboy.on('field', function(fieldName, value) {
		
		console.log(fieldName.toString() + ', ' + value.toString());
		
		if (fieldName.toString() == "username")
			userDetails.username = value.toString();
		else if (fieldName.toString() == "email")
			userDetails.email = value.toString();
		else if(fieldName.toString() == "firstName")
			userDetails.firstName = value.toString();
		else if (fieldName.toString() == "lastName")
			userDetails.lastName = value.toString();
		else if (fieldName.toString() == "mobileNo")
			userDetails.mobileNo = value.toString();
		else if (fieldName.toString() == "userType")
			userDetails._userType = userTypeId = value.toString();
	});
	
	userDetails.save(function(error) {
		if (error) {
			return response.json({Error: 'Error adding new user record.', OfficialError: error.toString(), dataPassed: user}).status(500).end();
		}
			
		sendAutomatedEmail(user.firstName, user.lastName, user.email, user.password);
			
		UserType.findOne({_id: userTypeId}).populate('_users').exec( function(getUserTypesError, userType) {
			userType._users.push(user);
			userType.save();
		});
			
		if(modeType != 'cms')
			return response.json(user).status(201).end();
		else
			response.redirect('/users/create/?created=1');
	});
});

router.post('/update_user', function(request, response) {
	
	var modeType = request.query.mode;
	
	var fstream;
	var filePath;
	var fileName;
	
	var today = new Date();
	var currDate = new Date(today.setHours(today.getHours() + 8)).getDate().toString();
	var currMonth = new Date(today.setHours(today.getHours() + 8)).getMonth().toString();
	var currYear = new Date(today.setHours(today.getHours() + 8)).getFullYear().toString();
	var currHour = new Date(today.setHours(today.getHours() + 8)).getHours().toString();
	var currMin = new Date(today.setHours(today.getHours() + 8)).getMinutes().toString();
	
	var id = request.query.id;
	var userTypeId;
	
	User.findOne({_id: id}).populate('_userType').exec(function(getUserError, userDetails) {
		request.pipe(request.busboy);
		request.busboy.on('file', function (fieldname, file, filename) {
			
			filePath = path.join(__dirname, '../../public/uploads/profiles/', currYear + '-' + currMonth + '-' + currDate + '-' + currHour + currMin + '-' + filename);
			userDetails.profilePic = '/uploads/profiles/' + currYear + '-' + currMonth + '-' + currDate + '-' + currHour + currMin + '-' + filename;
			
			console.log('{ filePath: ' + filePath + ', fileName: ' + config.baseUri + '/uploads/profiles/' + currYear + '-' + currMonth + '-' + currDate + '-' + currHour + currMin + '-' + filename + ' }');
			
			fstream = fs.createWriteStream(filePath);
			file.pipe(fstream);
			fstream.on('close', function () {
				console.log('Photo Uploaded');
			});
		});
		
		// Get values from all the drop down lists and textfields
		request.busboy.on('field', function(key, value) {
			
			if (key.toString() == 'username')
				userDetails.username = value.toString();
			else if (key.toString() == 'email')
				userDetails.email = value.toString();
			else if(key.toString() == 'firstName')
				userDetails.firstName = value.toString();
			else if (key.toString() == 'lastName')
				userDetails.lastName = value.toString();
			else if (key.toString() == 'mobileNo')
				userDetails.mobileNo = value.toString();
			else if (key.toString() == "userType")
				userDetails._userType = value.toString();
		});
		
		userDetails.save();
		
		if (modeType != 'cms')
			return response.json(userDetails).status(200).end();
		else
			response.redirect('/users/edit/?id=' + id + '&updated=1');
	});
});

/**
 * /delete_user - this API method will delete a single user record.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-10 01:03pm
 */
router.get('/delete_user', function (request, response) {
	var userId = request.query.id;
	
	User.findOneAndRemove({_id: userId}, function(error, user) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), Stack: error.stack.toString()}).status(200).end();
			else
				response.redirect('/users/list/' + request.query.id + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json({message: 'User record has been deleted.'}).status(200).end();
		else
			response.redirect('/users/list/?deleted=1');
	});
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