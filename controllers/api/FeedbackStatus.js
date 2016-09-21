/**
 * The FeedbackStatus.js controller will contain methods for creating new Feedback Statuses and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-21 03:58pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Feedback = require('./../../models/Feedback');
var FeedbackStatus = require('./../../models/FeedbackStatus');

/**
 * /get_list_selection - this method will retrieve all the status records for selection purposes.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-21 04:18pm
 */
router.get('/get_list_selection', function(request, response) {
	FeedbackStatus.find({}, function(error, feedbackStatuses) {
		return response.json(feedbackStatuses).status(200).end();
	});
});

/**
 * /create_feedback_status - this method will take a statusName value and create a new Feedback Status record.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-21 04:16pm
 */
router.post('/create_feedback_status', function (request, response) {
	var feedbackStatus = new FeedbackStatus({
		statusName: request.body.statusName
	});
	
	feedbackStatus.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/feedbackstatuses/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(feedbackStatus).status(201).end();
		else
			response.redirect('/feedbackstatuses/create/?created=1');
	});
});

module.exports = router;