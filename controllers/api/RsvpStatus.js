/**
 * The RsvpStatus.js controller will contain methods for creating new RSVP Statuses and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 6:59pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var User = require('./../../models/User');
var RsvpStatus = require('./../../models/RsvpStatus');

router.get('/get_list_selection', function(request, response) {
	RsvpStatus.find({}, function(error, rsvpStatuses) {
		return response.json(rsvpStatuses).status(200).end();
	});
});

router.post('/create_rsvp_status', function (request, response) {
	var rsvpStatus = new RsvpStatus({
		statusName: request.body.statusName
	});
	
	rsvpStatus.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/rsvpstatuses/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(rsvpStatus).status(201).end();
		else
			response.redirect('/rsvpstatuses/create/?created=1');
	});
});

module.exports = router;