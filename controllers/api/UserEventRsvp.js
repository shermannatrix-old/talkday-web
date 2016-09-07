/**
 * The UserEventRsvp.js controller will contain methods for adding new User Event RSVP records and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 7:02pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var User = require('./../../models/User');
var Event = require('./../../models/Event');
var UserEventRsvp = require('./../../models/UserEventRsvp');
var RsvpStatus = require('./../../models/RsvpStatus');

router.get('/get_rsvped_events', function(request, response) {
	UserEventRsvp.find({_id: request.body.user}).populate('_event _rsvpStatus').exec(function(error, userEventRsvps) {
		return response.json(userEventRsvps).status(200).end();
	});
});

router.post('/update_rsvp_status', function (request, response) {
	RsvpStatus.findOne({_statusName: request.query.status}, function (retStatusError, rsvpStatus) {
		UserEventRsvp.findOne({_id: request.query.id}, function(retRsvpError, userEventRsvp) {
			userEventRsvp._rsvpStatus = rsvpStatus._id;
			userEventRsvp.save();
			
			rsvpStatus._userEventRsvps.push(userEventRsvp);
			rsvpStatus.save();
		});
	});
});

router.post('/add_user_rsvp', function (request, response) {
	var userEventRsvp = new UserEventRsvp({
		_user: request.body.user,
		_event: request.body.event,
		_rsvpStatus: request.body.rsvpStatus
	});
	
	userEventRsvp.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/usereventrsvps/create/?error=1');
		}
		
		Event.findOne({_id: request.body.event}, function (retEventError, event) {
			event._userEventRsvps.push(userEventRsvp);
			event.save();
		});
		
		User.findOne({_id: request.body.user}, function (retUserError, user) {
			user._userEventRsvps.push(userEventRsvp);
			user.save();
		});
		
		if (request.query.mobile)
			return response.json(userEventRsvp).status(201).end();
		else
			response.redirect('/usereventrsvps/create/?created=1');
	});
});

module.exports = router;