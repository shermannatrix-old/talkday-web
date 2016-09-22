/**
 * The Feedback.js controller will contain methods for creating new Feedbacks and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 7:28pm
 * Additional Notes
 * ===============================================================================================
 *  - The feedback module is best tested through having the mobile app.
 */

'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var Feedback = require('./../../models/Feedback');
var FeedbackStatus = require('./../../models/FeedbackStatus');
var User = require('./../../models/User');

/**
 * /get_feedbacks_by_event - this method takes an event Id query parameter and retrieves feedbacks related to that event.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 10:17am
 */
router.get('/get_feedbacks_by_event', function (request, response) {
	var feedbacksByEvent = new Array();
	var eventId = request.query.event;
	
	Feedback.find({}).populate('_event').exec(function (error, feedbacks) {
		feedbacks.forEach(function(feedback, index) {
			if (eventId == feedback._event._id) {
				feedbacksByEvent.push(feedback);
			}
		});
		
		return response.json(feedbacksByEvent).status(200).end();
	});
});

/**
 * /add_feedback - this method will add a new feedback document to the database.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-21 04:41pm
 */
router.post('/add_feedback', function (request, response) {
	var eventId = request.body.event,
		statusId = request.body.feedbackStatus,
		userId = request.body.user,
		modeType = request.query.mode;
	
	var feedback = new Feedback({
		_event			: eventId,
		_feedbackStatus	: statusId,
		_user			: userId,
		feedbackContent	: request.body.feedbackContent,
		rating			: request.body.rating
	});
	
	feedback.save(function(error) {
		
		/* Point to note: If the user is performing the API call from either a mobile app / frontend website, we return JSON data. */
		
		if (error) {
			if ( modeType == 'cms' )
				response.redirect ( '/feedback/create/?error=1' );
			else
				return response.json ( { Error: error.toString(), ErrorStack: error.stack.toString() } ).status(500).end();
		}
		
		Event.find ( { _id: eventId }, function ( findEventErr, eventDetails ) {
			eventDetails._feedbacks.push ( feedback );
			eventDetails.save ( );
		});
		
		User.find ( { _id: userId }, function ( findUserErr, userDetails ) {
			userDetails._feedbacks.push ( feedback );
			userDetails.save ( );
		});
		
		FeedbackStatus.find ( { _id: statusId }, function ( findStatusErr, statusDetails ) {
			statusDetails._feedbacks.push ( feedback );
			statusDetails.save ( );
		});
		
		if ( modeType == 'cms' )
			response.render ('feedback/create', {
				title: 'Add Feedback',
				baseUri: config.baseUri,
				show_info: 'Feedback Added.',
				username: request.cookies.username
			});
			
		else
			return response.json(feedback).status(201).end();
	});
});

/**
 * /updated_feedback - this method will update the feedback document record. At the same time, it will also check for related documents and remove those links.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-21 05:46pm
 * Date Updated	: 2016-09-22 10:08am
 * Update Log
 * ===============================================================================================
 * (1) Added the modeType to the context object when rendering the edit view.
 */
router.post('/update_feedback', function (request, response) {
	var eventId = request.body.event,
		statusId = request.body.feedbackStatus,
		userId = request.body.user,
		feedbackId = request.query.id,
		modeType = request.query.mode;
	
	var query = {
		_id: feedbackId
	};
	
	var feedback = {
		_event: eventId,
		_feedbackStatus: statusId,
		_userId: userId,
		feedbackContent: request.body.feedbackContent,
		rating: request.body.rating
	};
	
	// Before we update the feedback document with the new information, we want to also make sure all old document relationships are removed.
	Feedback.findOne({_id: feedbackId} ).populate('_event _feedbackStatus _user').exec( function (findFeedbackErr, oldFeedbackDetails) {
		
		// If the event detail has been modified, we will remove the feedback record from the matching Event document.
		if (oldFeedbackDetails._event._id != eventId) {
			Event.findOne({_id: oldFeedbackDetails._event._id}).populate('_feedbacks').exec(function(findEventErr, eventDetails) {
				eventDetails._feedbacks.forEach(function(fb, index) {
					if (fb._id == feedbackId) {
						eventDetails._feedbacks.removeAt(index);
						eventDetails.save();
					}
				});
			});
		}
		
		// If the status detail has been changed, we also do the same by removing the feedback record from the matching Feedback Status document.
		if (oldFeedbackDetails._feedbackStatus._id != statusId) {
			FeedbackStatus.findOne({_id: oldFeedbackDetails._feedbackStatus._id}).populate('_feedbacks').exec(function (findStatusErr, statusDetails) {
				statusDetails._feedbacks.forEach(function(fb, index) {
					if (fb._id == feedbackId) {
						statusDetails._feedbacks.removeAt(index);
						statusDetails.save();
					}
				});
			});
		}
		
		// If the user detail has been changed, we also do the same as the above.
		if (oldFeedbackDetails._user._id != userId) {
			User.findOne({_id: oldFeedbackDetails._user._id}).populate('_feedbacks').exec(function (findUserErr, userDetails) {
				userDetails._feedbacks.forEach(function(fb, index) {
					if (fb._id == feedbackId) {
						userDetails._feedbacks.removeAt(index);
						userDetails.save();
					}
				})
			});
		}
		
		// Once we have removed all necessary old relationship links, now we need to update the documents with the updated Feedback document.
		Feedback.findOneAndUpdate(query, feedback, {new: true}, function(updateFeedbackErr, updatedFeedback) {
			if (oldFeedbackDetails._event._id != eventId) {
				Event.findOne({_id: eventId}).populate('_feedbacks').exec(function (findEventErr, eventDetails) {
					eventDetails._feedbacks.push(updatedFeedback);
					eventDetails.save();
				});
			}
			
			if (oldFeedbackDetails._feedbackStatus._id != statusId) {
				FeedbackStatus.findOne({_id: statusId}).populate('_feedbacks').exec(function(findStatusErr, statusDetails) {
					statusDetails._feedbacks.push(updatedFeedback);
					statusDetails.save();
				});
			}
			
			if (oldFeedbackDetails._user._id != userId) {
				User.findOne({_id: userId}).populate('_feedbacks').exec(function(findUserErr, userDetails) {
					userDetails._feedbacks.push(updatedFeedback);
					userDetails.save();
				});
			}
			
			if (modeType == 'cms')
				response.render('feedback/edit', {
					title: 'Edit Feedback',
					baseUri: config.baseUri,
					show_info: 'Feedback Updated.',
					feedback: updatedFeedback,
					username: request.cookies.username,
					mode: modeType
				});
			else
				return response.json(updatedFeedback).status(200).end();
		});
	});
	
	
	
});

module.exports = router;