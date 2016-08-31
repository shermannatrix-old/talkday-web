'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventType = require('./../../models/EventType');

router.get('/get_list_selection', function(request, response) {
	EventType.find({}, function(error, eventTypes) {
		return response.json(eventTypes).status(200).end();
	});
});

router.post('/create_event_type', function (request, response) {
	var eventType = new EventType({
		typeName: request.body.typeName
	});
	
	eventType.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventTypes/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(eventType).status(201).end();
		else
			response.redirect('/eventType/create/?created=1');
	});
});

module.exports = router;