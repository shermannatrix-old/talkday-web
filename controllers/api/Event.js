/**
 * The Event.js controller will contain methods for creating new Events and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 7:28pm
 */

'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventType = require('./../../models/EventType');
var EventCategory = require('./../../models/EventCategory');
var EventStatus = require('./../../models/EventStatus');
var EventSpeaker = require('./../../models/EventSpeaker');
var EventVenue = require('./../../models/EventVenue');
var UserEventRsvp = require('./../../models/UserEventRsvp');

/**
 * parseDate() will accept a date value in string format and then convert it into an ISO standard format.
 * @param dateVal A selected date value passed from the UI.
 * @returns {string} The final date value in ISO format.
 */
function parseDate(dateVal) {
	var day = dateVal.substr(0, 2);
	var month = dateVal.substr(3, 2);
	var year = dateVal.substr(6, 4);
	
	var hour = dateVal.substr(11,2);
	var min = dateVal.substr(14,2);
	
	return year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':00';
}


router.get('/get_list_selection', function(request, response) {
	Event.find({}, function(error, events) {
		return response.json(events).status(200).end();
	});
});

/**
 * The /add_event method will accept a json object that is posted from the UI and insert a new Event record.
 */
router.post('/add_event', function (request, response) {
	var startTimeISO = parseDate(request.body.timeslotstarttime.toString());
	var endTimeISO = parseDate(request.body.timeslotendtime.toString());
	
	console.log('Start Time: ' + startTimeISO + ', End Time: ' + endTimeISO);
	
	var finalStartTime = new Date(startTimeISO);
	var finalEndTime = new Date(endTimeISO);
	
	var event = new Event({
		eventName		: request.body.eventName,
		eventDesc		: request.body.eventDesc,
		timeSlotStart	: new Date(finalStartTime.setHours(finalStartTime.getHours())),
		timeSlotEnd		: new Date(finalEndTime.setHours(finalEndTime.getHours())),
		_eventStatus	: request.body.eventStatus,
		_eventType		: request.body.eventType,
		_eventCategory	: request.body.eventCategory,
		_eventVenue		: request.body.eventVenue,
	});
	
	event.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/events/create/?error=1');
		}
		
		EventType.findOne({_id: request.body.eventType}, function(retEventTypeError, eventType) {
			eventType._events.push(event);
			eventType.save();
		});
		
		EventCategory.findOne({_id: request.body.eventCategory}, function (retCategoryError, eventCategory) {
			eventCategory._events.push(event);
			eventCategory.save();
		});
		
		EventStatus.findOne({_id: reuest.body.eventStatus}, function (retStatusError, eventStatus) {
			eventStatus._events.push(event);
			eventStatus.save();
		});
		
		EventVenue.findOne({_id: request.body.eventVenue}, function (retVenueError, eventVenue) {
			eventVenue._events.push(event);
			eventVenue.save();
		});
		
		if (request.query.mobile)
			return response.json(event).status(201).end();
		else
			response.redirect('/events/create/?created=1');
	});
});

module.exports = router;