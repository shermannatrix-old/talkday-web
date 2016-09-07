/**
 * The EventStatus.js controller will contain methods for creating new Event Statuses and also retrieving those values for listing purposes.
 * Created by	: Sherman
 * Added on		: 2016-09-07 7:09pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventStatus = require('./../../models/EventStatus');

router.get('/get_list_selection', function(request, response) {
	EventStatus.find({}, function(error, eventStatuses) {
		return response.json(eventStatuses).status(200).end();
	});
});

router.post('/create_event_status', function (request, response) {
	var eventStatus = new EventStatus({
		statusName: request.body.statusName
	});
	
	eventStatus.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventstatuses/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(eventStatus).status(201).end();
		else
			response.redirect('/eventstatuses/create/?created=1');
	});
});

module.exports = router;