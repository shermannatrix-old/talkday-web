/**
 * The Event.js controller will contain methods for creating new Events and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-07 7:28pm
 * Date Modified	: 2016-09-29 09:07pm
 * ===============================================================================================================
 * Update Log:
 * (1) Added the API method /get_event_speakers
 * (2) Added the API method /assign_speakers
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
 * /get_list - this API method will return a list of Events in the form of a ViewModel collection.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-27 04:48pm
 */
router.get('/get_list', function (request, response) {
	var eventViewModel = [];
	
	Event.find({}).populate('_eventType _eventCategory _eventStatus _eventVenue').exec(function (error, events) {
		events.forEach(function(event, index) {
			
			//var schedulerStartDate = new Date(event.startDate.getFullYear().toString() + '-' + (event.startDate.getMonth() + 1).toString() + '-' + event.startDate.getDate() + ' ' + event.startTime);
			//var schedulerEndDate = new Date(event.endDate.getFullYear().toString() + '-' + (event.endDate.getMonth() + 1).toString() + '-' + event.endDate.getDate() + ' ' + event.endTime);
			var schedulerStartDate = new Date(event.startDate.getFullYear().toString() + '/' + (event.startDate.getMonth() + 1).toString() + '/' + event.startDate.getDate() + ' ' + event.startTime);
			var schedulerEndDate = new Date(event.endDate.getFullYear().toString() + '/' + (event.endDate.getMonth() + 1).toString() + '/' + event.endDate.getDate() + ' ' + event.endTime);
			
			eventViewModel.push({
				_id: event._id,
				eventName: event.eventName,
				eventDesc: event.eventDesc,
				schedulerStartDate: new Date(schedulerStartDate.setHours(schedulerStartDate.getHours() + 8)),
				schedulerEndDate: new Date(schedulerEndDate.setHours(schedulerEndDate.getHours() + 8)),
				startDate: event.startDate,
				endDate: event.endDate,
				startTime: event.startTime,
				endTime: event.endTime,
				isAllDay: event.isAllDay,
				_eventStatus: event._eventStatus,
				_eventCategory: event._eventCategory,
				_eventType: event._eventType,
				_eventVenue: event._eventVenue
			});
		});
		
		return response.json(eventViewModel).status(200).end();
	});
});

/**
 * /get_event_speakers?event=[eventId] - this API method will retrieve a list of all the speakers speaking at the event.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-29 08:54pm
 */
router.get('/get_event_speakers', function (request, response) {
	var eventId = request.query.event;
	
	Event.find({_id: eventId}).populate('_speakers').exec(function(error, eventDetails) {
		if (error) {
				return response.json({ErrorDetails: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
		}
		
		return response.json(eventDetails._speakers).status(200).end();
	});
});

/**
 * /assign_speakers/?event=[eventId]&speaker=[speakerId] - this API method will add the speaker to the selected Event.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-29 09:06pm
 */
router.get('/assign_speakers', function (request, response) {
	var eventId = request.query.event,
		speakerId = request.query.speaker,
		modeType = request.query.mode;
	
	Event.findOne({_id: eventId}).populate('_speakers').exec(function (getEventErr, event) {
		if ( getEventErr ) {
			if ( modeType == 'cms' )
				response.redirect ( '/events/view_speakers/?event=' + eventId + '&error=1' );
			else
				return response.json ( { ErrorDetails: error.toString (), ErrorStack: error.stack.toString () } ).status ( 500 ).end ();
		}
		// Check to see if the event already has the speaker. If no, then add the speaker to the Event.
		if ( !event._speakers.contains ( speakerId ) ) {
			event._speakers.push ( speakerId );
			event.save ();
		}
		
		EventSpeaker.findOne({_id: speakerId}).populate('_events').exec(function (getSpeakerErr, speaker) {
			if (getSpeakerErr) {
				if ( modeType == 'cms' )
					response.redirect ( '/events/view_speakers/?event=' + eventId + '&error=1' );
				else
					return response.json ( { ErrorDetails: error.toString (), ErrorStack: error.stack.toString () } ).status ( 500 ).end ();
			}
			
			// Likewise, check to see if the Speaker is already speaking at this Event. If not, add the Event to the Speaker's _events collection.
			if (!speaker._events.contains(eventId)) {
				speaker._events.push ( event );
				speaker.save ();
			}
			
			if (modeType == 'cms')
			{
				response.redirect('/events/view_speakers/?event=' + eventId + '&updated=1');
			}
			else
				return response.json({Event: event, Speaker: speaker}).status(200).end();
		});
	});
});

/**
 * parseDate() will accept a date value in string format and then convert it into an ISO standard format.
 * @param dateVal A selected date value passed from the UI.
 * @returns {string} The final date value in ISO format.
 */
function parseDate(dateVal) {
	var day = dateVal.substr(0, 2);
	var month = dateVal.substr(3, 2);
	var year = dateVal.substr(6, 4);
	
	//var hour = dateVal.substr(11,2);
	//var min = dateVal.substr(14,2);
	
	return year + '-' + month + '-' + day + 'T12:00:00';
}


router.get('/get_list_selection', function(request, response) {
	Event.find({}, function(error, events) {
		return response.json(events).status(200).end();
	});
});

/**
 * The /add_event method will accept a json object that is posted from the UI and insert a new Event record.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 7:28pm
 */
router.post('/add_event', function (request, response) {
	var startDateISO = parseDate(request.body.startDate.toString());
	var endDateISO = parseDate(request.body.endDate.toString());
	
	console.log('Start Date: ' + startDateISO + ', End Date: ' + endDateISO);
	console.log('Start Time: ' + request.body.startTime + ', End Time: ' + request.body.endTime);
	
	//var finalStartDate = new Date(startDateISO);
	//var finalEndDate = new Date(endDateISO);
	
	var isAllDay = false;
	
	if (request.body.isAllDay)
		isAllDay = true;
	
	var event = new Event({
		eventName		: request.body.eventName,
		eventDesc		: request.body.eventDesc,
		startDate		: new Date(startDateISO),
		endDate			: new Date(endDateISO),
		isAllDay		: isAllDay,
		_eventStatus	: request.body.eventStatus,
		_eventType		: request.body.eventType,
		_eventCategory	: request.body.eventCategory,
		_eventVenue		: request.body.eventVenue,
	});
	
	if (!isAllDay) {
		event.startTime = request.body.startTime;
		event.endTime = request.body.endTime;
	}
	
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
		
		EventStatus.findOne({_id: request.body.eventStatus}, function (retStatusError, eventStatus) {
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
			response.redirect('/events/create/?created=1&event=' + event.eventName);
	});
});

/**
 * /delete_event - this API method will delete a single Event record.
 */
router.get('/delete_event', function (request, response) {
	var modeType = request.query.mode;
	
	Event.findOneAndRemove({_id: request.query.id}, function(error, event) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), Stack: error.stack.toString()}).status(200).end();
			else
				response.redirect('/events/dashboard/?tab=list&id=' + request.query.id + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json({message: 'Event has been deleted.'}).status(200).end();
		else
			response.redirect('/events/dashboard/?tab=list&deleted=1');
	});
});

module.exports = router;