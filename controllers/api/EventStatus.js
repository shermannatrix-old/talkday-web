/**
 * The EventStatus.js controller will contain methods for creating new Event Statuses and also retrieving those values for listing purposes.
 * Created by		: Sherman
 * Date Created		: 2016-09-07 7:09pm
 * Date Modified	: 2016-09-22 05:36pm
 * ==================================================================
 * Update Log:
 * (1) Added /get_list for retrieving the full Event Status records.
 * (2) Added /update_event_status for updating the Event Status records.
 * (3) Added /delete_status for removing a single Event Status record.
 */

'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventStatus = require('./../../models/EventStatus');

/**
 * /get_list - this method retrieves all the Event Status documents together with their related Event documents.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 03:50pm
 */
router.get('/get_list', function(request, response) {
	EventStatus.find({}).populate('_events').exec(function (error, eventStatuses) {
		return response.json(eventStatuses).status(200).end();
	});
});

router.get('/get_list_selection', function(request, response) {
	EventStatus.find({}, function(error, eventStatuses) {
		return response.json(eventStatuses).status(200).end();
	});
});

/**
 * /create_event_status - this method take the statusName that is provided and create a new record.
 * HTTP Method	: POST
 * Created By	: Sherman Chen
 * Date Updated	: 2016-09-22 03:48pm
 */
router.post('/create_event_status', function (request, response) {
	console.log('Status Name: ' + request.body.statusName);
	
	var eventStatus = new EventStatus({
		statusName: request.body.statusName
	});
	
	eventStatus.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventstatus/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(eventStatus).status(201).end();
		else
			response.redirect('/eventstatus/create/?created=1&status=' + eventStatus.statusName);
	});
});

/**
 * /update_event_status - this method take the statusName that is provided and update the record with the specified status _id.
 * HTTP Method	: POST
 * Created By	: Sherman Chen
 * Date Created	: 2016-09-22 03:48pm
 */
router.post('/update_event_status', function (request, response) {
	var modeType = request.query.mode,		// Is the request coming from the CMS, frontend website or mobile app?
		statusId = request.query.id;		// The Event Status's _id value.
	
	var updateData = {
		statusName: request.body.statusName
	};
	
	var query = {
		_id: statusId
	};
	
	EventStatus.findOneAndUpdate (query, updateData, {new: true}, function (error, updatedStatus) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventstatus/edit/?id=' + statusId + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json(updatedStatus).status(200).end();
		else
			response.redirect('/eventstatus/edit/?id=' + statusId + '&updated=1');
	});
});

/**
 * /delete_status - this method will delete a single Event Status record.
 * HTTP Method	: GET
 *
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 05:36pm
 */
router.get('/delete_status', function (request, response) {
	var modeType = request.query.mode;
	
	EventStatus.findOneAndRemove({_id: request.query.id}, function(error, eventStatus) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), Stack: error.stack.toString()}).status(200).end();
			else
				response.redirect('/eventstatus/list/?id=' + request.query.id + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json({message: 'Event Status has been deleted.'}).status(200).end();
		else
			response.redirect('/eventstatus/list/?deleted=1');
	});
});

module.exports = router;