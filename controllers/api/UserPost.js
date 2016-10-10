/**
 * The UserPost.js controller will contain methods for creating new User Posts and also retrieving those values for listing purposes.
 * Created by			: Sherman Chen
 * Date Created			: 2016-09-27 01:27pm
 * Date Modified		: 2016-10-07 04:34pm
 * ===============================================================================================================
 * Update Log:
 * (1) Added the /get_user_postings API method.
 */
'use strict';

var express = require('express');
var router = express.Router();
var assert = require('assert');

var config = require('./../../config/config');
var User = require('./../../models/User');
var UserPost = require('./../../models/UserPost');

var fs = require('fs'),
	path = require('path'),
	busboy = require('connect-busboy');

router.use(busboy());

router.get('/get_all_postings', function (request, response) {
	UserPost.find({}).sort({dateAdded: 'desc'}).populate('_user').exec(function (error, userPostings) {
		return response.json(userPostings).status(200).end();
	});
});

/**
 * /get_user_postings - this API method will return a list of all the User's updates.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-07 04:33pm
 */
router.get('/get_user_postings', function (request, response) {
	UserPost.find({_id: request.query.id}).sort({dateAdded: 'desc'}).exec( function (error, userPostings) {
		return response.json(userPostings).status(200).end();
	});
});

/**
 * /add_text_update - this API method will post a single text post.
 * Http Method		: POST
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-27 01:28pm
 * Date Modified	: 2016-10-07 04:36pm
 */
router.post('/add_text_posting', function (request, response) {
	var userPost = new UserPost({
		textUpdate: request.body.textUpdate,
		_user: request.body.userId
	});
	
	userPost.save(function (error) {
		User.findOne({_id: request.body.userId}, function(findUserErr, userDetails) {
			userDetails._userPosts.push(userPost);
			userDetails.save();
		});
		
		response.json(userPost).status(201).end();
	});
});

router.post('/add_user_post', function (request, response) {
	var fstream;
	var filePath;
	var fileName;
	
	var currDate = new Date().getUTCDate().toString();
	var currMonth = new Date().getUTCMonth().toString();
	var currYear = new Date().getUTCFullYear().toString();
	
	var userPost = new UserPost();
	
	request.pipe(request.busboy);
	request.busboy.on('file', function (fieldname, file, filename) {
		
		if (path.extname(filename) == '.mp4' || path.extname(filename) == '.m4v') {
			filePath = path.join(__dirname, '../../public/uploads/user_postings/videos/', currYear + '-' + currMonth + '-' + currDate + '-' + filename);
			userPost.videoUpdate = config.baseUri + 'uploads/user_postings/videos/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename;
		}
		else if (path.extname(filename) == '.jpeg' || path.extname(filename) == '.jpg' || path.extname(filename) == '.png'){
			filePath = path.join(__dirname, '../../public/uploads/user_postings/photos/', currYear + '-' + currMonth + '-' + currDate + '-' + filename);
			userPost.photoUpdate = config.baseUri + 'uploads/user_postings/photos/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename;
		}
		
		fstream = fs.createWriteStream(filePath);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log('Media Content Uploaded');
		});
	});
	
	// Get values from all the drop down lists and textfields
	request.busboy.on('field', function(key, value) {
		
		if (key.toString() == 'textUpdate')
			userPost.textUpdate = value.toString();
	});
	
	userPost._user = request.query.id;
	
	if (userPost) {
		userPost.save(function(error) {
			if (error) {
				return response.json({Error: 'Error adding new user posting.', OfficialError: error.toString(), dataPassed: user}).status(500).end();
			}
			
			User.findOne({_id: request.query.id}, function(error, user) {
				user._userPosts.push(userPost);
				user.save();
			});
			
			return response.json(userPost).status(201).end();
		});
	}
	
});

module.exports = router;