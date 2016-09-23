/**
 * The EventType.js controller will contain methods for creating new Event Types and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-23 11:37am
 * ==================================================================
 * Update Log:
 * (1) Added /get_list method
 * (2) Added /update_event_type
 * (3) Added /delete_event_type
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventType = require('./../../models/EventType');

/**
 * /get_list - this API method will retrieve all the Event Type documents together with their related Events documents.
 * HTTP Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-23 11:12am
 */
router.get('/get_list', function (request, response) {
	EventType.find({}).populate('_events').exec(function(error, eventTypes) {
		return response.json(eventTypes).status(200).end();
	});
});

/**
 * /get_list_selection - this API method will retrieve all the Event Type documents solely for selection purposes.
 * HTTP Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 06:58pm
 */
router.get('/get_list_selection', function(request, response) {
	EventType.find({}, function(error, eventTypes) {
		return response.json(eventTypes).status(200).end();
	});
});

/**
 * /create_event_type - this API method will create a new Event Type document.
 * Http Method		: POST
 * Content-type		: application/json
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 06:58pm
 * Date Modified	: 2016-09-23 11:26am
 * ==================================================================
 * Update Log:
 * (1) Added the modeType variable.
 */
router.post('/create_event_type', function (request, response) {
	var modeType = request.query.mode;
	
	var eventType = new EventType({
		typeName: request.body.typeName
	});
	
	eventType.save(function(error) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventtypes/create/?error=1');
		}
		
		if (modeType != 'cms')
			return response.json(eventType).status(201).end();
		else
			response.redirect('/eventtypes/create/?created=1&typeName=' + eventType.typeName);
	});
});

/**
 * /update_event_type - this API method will update an existing Event Type document based on the specified _id.
 * Http Method		: POST
 * Content-type		: application/json
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-23 11:29am
 */
router.post('/update_event_type', function (request, response) {
	var modeType = request.query.mode,
		typeId = request.query.id;
	
	var updateData = {
		typeName: request.body.typeName
	};
	
	var query = {
		_id: typeId
	};
	
	EventType.findOneAndUpdate(query, updateData, {new: true}, function(error, updatedEventType) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventtypes/edit/?id=' + typeId + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json(updatedEventType).status(200).end();
		else
			response.redirect('/eventtypes/edit/?id=' + typeId + '&updated=1');
	});
});

/**
 * /delete_event_type - this API method will delete an existing Event Type document based on the specified _id.
 * Http Method		: GET
 * Content-type		: application/json
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-23 01:41pm
 */
router.get('/delete_event_type', function (request, response) {
	var modeType = request.query.mode,
		typeId = request.query.id;
	
	EventType.findOneAndRemove({_id: typeId}, function(error, eventType) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), Stack: error.stack.toString()}).status(200).end();
			else
				response.redirect('/eventtypes/list/?id=' + request.query.id + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json({message: 'Event Type has been deleted.'}).status(200).end();
		else
			response.redirect('/eventtypes/list/?deleted=1');
	});
});

module.exports = router;