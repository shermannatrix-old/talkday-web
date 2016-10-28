/**
 * The Event.js controller will contain methods for creating new Events and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-07 7:28pm
 * Date Modified	: 2016-10-28 02:46pm
 * ===============================================================================================================
 * Update Log:
 * (1) Added API method /get_events_report
 */

'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var dateFormat = require('dateformat');
var Event = require('./../../models/Event');
var EventType = require('./../../models/EventType');
var EventCategory = require('./../../models/EventCategory');
var EventStatus = require('./../../models/EventStatus');
var EventSpeaker = require('./../../models/EventSpeaker');
var EventVenue = require('./../../models/EventVenue');
var UserEventRsvp = require('./../../models/UserEventRsvp');

/**
 * /get_all_events - this API method will return a list of Events in the form of a ViewModel collection.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-27 04:48pm
 * Date Modified	: 2016-09-30 01:07pm
 * ===============================================================================================================
 * Update Log:
 * (1) Updated the Web API name to /get_all_events
 */
router.get('/get_all_events', function (request, response) {
	Event.find({}).populate('_eventType _eventCategory _eventStatus _eventVenue _speakers').exec(function (error, events) {
		return response.json(events).status(200).end();
	});
});

/**
 * /get_events_report/?filter=[filterType] - this API method will return report data depending on the filterType.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-28 11:02am
 */
router.get('/get_events_report', function (request, response) {
	var filterType = request.query.filter;

	Event.find({}, function(getCountError, eventCount) {
		if (filterType == 'category') {
			Event.aggregate([
				{
					$group: {
						_id: '$_eventCategory',  //$region is the column name in collection,
						count: {$sum: 1}
					}
				}
			], function (error, events) {
				if (error) {
					console.log(error.toString());
				}

				events.forEach(function(event, index) {
					event.percentage = ( event.count / eventCount.length ) * 100.0;

					console.log('Percentage: ' + event.percentage);
				});

				EventCategory.populate(events, { "path": "_id" }, function(err,results) {
					return response.json(results).status(200).end();
				});
			});
		}
		else if (filterType == 'type') {
			Event.aggregate([
				{
					$group: {
						_id: '$_eventType',  //$region is the column name in collection,
						count: {$sum: 1}
					}
				}
			], function (error, events) {
				if (error) {
					console.log(error.toString());
				}

				events.forEach(function(event, index) {
					event.percentage = ( event.count / eventCount.length ) * 100.0;

					console.log('Percentage: ' + event.percentage);
				});

				EventType.populate(events, { "path": "_id" }, function(err,results) {
					return response.json(results).status(200).end();
				});
			});
		}
	});


});

/**
 * /assign_speakers/?event=[eventId]&speaker=[speakerId] - this API method will add the speaker to the selected Event.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-29 09:06pm
 * Date Modified	: 2016-09-29 02:06pm
 * ===============================================================================================================
 * Update Log:
 * (1) Replace the invalid array methods containsAny() and instead use forEach() to loop through.
 */
router.get('/assign_speaker', function (request, response) {
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
		var i = 0;
		
		EventSpeaker.findOne({_id: speakerId}, function(getSpeakerError, speakerDetails) {
			event._speakers.forEach(function(speaker, index) {
				
				if (speakerDetails != speaker)
					i++;
			});
			
			if (event._speakers.length == 0 || i == event._speakers.length) {
				event._speakers.push ( speakerDetails );
				event.save ();
			}
		});
		
		i = 0;
		
		EventSpeaker.findOne({_id: speakerId}).populate('_events').exec(function (getSpeakerErr, speaker) {
			if (getSpeakerErr) {
				if ( modeType == 'cms' )
					response.redirect ( '/events/view_speakers/?event=' + eventId + '&error=1' );
				else
					return response.json ( { ErrorDetails: error.toString (), ErrorStack: error.stack.toString () } ).status ( 500 ).end ();
			}
			
			// Likewise, check to see if the Speaker is already speaking at this Event. If not, add the Event to the Speaker's _events collection.
			speaker._events.forEach(function(eventDetails, index) {
				if (event != eventDetails)
					i++;
			});
			
			if (speaker._events.length == 0 || i == speaker._events.length) {
				speaker._events.push ( event );
				speaker.save ();
			}
			
			if (modeType == 'cms')
			{
				response.redirect('/events/edit/?id=' + eventId + '&updated=1');
			}
			else
				return response.json({Event: event, Speaker: speaker}).status(200).end();
		});
	});
});

/**
 * /remove_event_speaker/?speaker=[speakerId]&event=[eventId] - this API method will remove the specified speaker from the specified event.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-06 03:16pm
 */
router.get('/remove_event_speaker', function (request, response) {
	var eventId = request.query.event,
		speakerId = request.query.speaker,
		modeType = request.query.mode;
	
	Event.findOne({_id: eventId}).populate('_speakers').exec(function (getEventsError, eventDetails) {
		eventDetails._speakers.forEach(function (speakerDetails, index) {
			if (speakerDetails._id.toString() === speakerId) {
				eventDetails._speakers.splice(index, 1);
				eventDetails.save();
			}
		});
	});
	
	EventSpeaker.findOne({_id: speakerId}).populate('_events').exec(function (getSpeakersError, speakerDetails) {
		speakerDetails._events.forEach(function (eventDetails, index) {
			if (eventDetails._id.toString() === eventId) {
				speakerDetails._events.splice(index, 1);
				speakerDetails.save();
			}
		});
	});
	
	if (modeType == 'cms')
		response.redirect('/events/edit/?id=' + eventId + '&updated=1');
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
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 7:28pm
 * Date Updated		: 2016-09-30 02:55pm
 * ===============================================================================================================
 * Update Log:
 * (1) Updated the date values to use the parseDate() method, and then passing in the time value if its not an all day event.
 */
router.post('/add_event', function (request, response) {
	var startDateISO = parseDate(request.body.startDate.toString());
	var endDateISO = parseDate(request.body.endDate.toString());
	
	console.log('Start Date: ' + startDateISO + ', End Date: ' + endDateISO);
	
	var finalStartDate = new Date(startDateISO);
	var finalEndDate = new Date(endDateISO);
	
	var isAllDay = false;
	
	if (request.body.isAllDay)
		isAllDay = true;
	
	var event = new Event({
		eventName		: request.body.eventName,
		eventDesc		: request.body.eventDesc,
		startDate		: new Date(finalStartDate.setHours(finalStartDate.getHours())),
		endDate			: new Date(finalEndDate.setHours(finalEndDate.getHours())),
		startTime		: '12:00 AM',
		endTime			: '12:00 AM',
		isAllDay		: isAllDay,
		_eventStatus	: request.body.eventStatus,
		_eventType		: request.body.eventType,
		_eventCategory	: request.body.eventCategory,
		_eventVenue		: request.body.eventVenue,
	});
	
	if (!isAllDay) {
		event.startTime = dateFormat(finalStartDate.setHours(finalStartDate.getHours() + 8), 'GMT:h:MM TT');
		event.endTime = dateFormat(finalEndDate.setHours(finalStartDate.getHours() + 8), 'GMT:h:MM TT');
	}
	
	event.save(function(error) {
		
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/events/create/?error=1');
		}
		
		console.log('Event: ' + JSON.stringify(event));
		
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
 * /update_event - the most basic update event method at this point in time.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-04 11:05pm
 * Date Modified	: 2016-10-06 12:36pm
 * ===============================================================================================================
 * Update Log:
 * (1) Codes have to been added to handle the removing of the necessary relations when updating the Event Document
 */
router.post('/update_event', function (request, response) {
	var eventId = request.query.id,
		modeType = request.query.mode;
	
	var startDateISO = parseDate(request.body.startDate.toString());
	var endDateISO = parseDate(request.body.endDate.toString());
	
	console.log('Start Date: ' + startDateISO + ', End Date: ' + endDateISO);
	
	var finalStartDate = new Date(startDateISO);
	var finalEndDate = new Date(endDateISO);
	
	var isAllDay = false;
	
	if (request.body.isAllDay)
		isAllDay = true;
	
	var updateData = {
		eventName		: request.body.eventName,
		eventDesc		: request.body.eventDesc,
		startDate		: new Date(finalStartDate.setHours(finalStartDate.getHours())),
		endDate			: new Date(finalEndDate.setHours(finalEndDate.getHours())),
		startTime		: '12:00 AM',
		endTime			: '12:00 AM',
		isAllDay		: isAllDay,
		_eventStatus	: request.body.eventStatus,
		_eventType		: request.body.eventType,
		_eventCategory	: request.body.eventCategory,
		_eventVenue		: request.body.eventVenue,
	};
	
	if (!isAllDay) {
		updateData.startTime = dateFormat(finalStartDate, 'GMT:h:MM TT');
		updateData.endTime = dateFormat(finalEndDate, 'GMT:h:MM TT');
	}
	
	var query = {
		_id: request.query.id
	};
	
	Event.findOne({_id: request.query.id}).populate('_eventStatus _eventType _eventCategory _eventVenue').exec( function (error, eventDetails) {
		EventStatus.findOne({_id: eventDetails._eventStatus._id}).populate('_events').exec(function(getStatusError, eventStatus) {
			eventStatus._events.forEach(function(event, index) {
				if (event._id.toString() === eventDetails._id.toString())
					eventStatus._events.splice(index, 1);
			});
			
			eventStatus.save();
		});
		
		EventVenue.findOne({_id: eventDetails._eventVenue._id}).populate('_events').exec(function(getVenueError, eventVenue) {
			eventVenue._events.forEach(function(event, index) {
				if (event._id.toString() === eventDetails._id.toString())
					eventVenue._events.splice(index, 1);
			});
			
			eventVenue.save();
		});
		
		EventType.findOne({_id: eventDetails._eventType._id}).populate('_events').exec(function(getEventTypeError, eventType) {
			eventType._events.forEach(function(event, index) {
				if (event._id.toString() === eventDetails._id.toString())
					eventType._events.splice(index, 1);
			});
			
			eventType.save();
		});
		
		EventCategory.findOne({_id: eventDetails._eventCategory._id}).populate('_events').exec(function(getEventCategoryError, eventCategory) {
			eventCategory._events.forEach(function(event, index) {
				if (event._id.toString() === eventDetails._id.toString())
					eventCategory._events.splice(index, 1);
			});
			
			eventCategory.save();
		});
	});
	
	Event.findOneAndUpdate(query, updateData, {new: true}, function (error, updatedEvent) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/events/edit/?id=' + eventId + '&error=1');
		}
		
		EventType.findOne({_id: request.body.eventType}, function(retEventTypeError, eventType) {
			eventType._events.push(updatedEvent);
			eventType.save();
		});
		
		EventCategory.findOne({_id: request.body.eventCategory}, function (retCategoryError, eventCategory) {
			eventCategory._events.push(updatedEvent);
			eventCategory.save();
		});
		
		EventStatus.findOne({_id: request.body.eventStatus}, function (retStatusError, eventStatus) {
			eventStatus._events.push(updatedEvent);
			eventStatus.save();
		});
		
		EventVenue.findOne({_id: request.body.eventVenue}, function (retVenueError, eventVenue) {
			eventVenue._events.push(updatedEvent);
			eventVenue.save();
		});
		
		if (modeType != 'cms')
			return response.json(updatedEvent).status(200).end();
		else
			response.redirect('/events/edit/?id=' + eventId + '&updated=1');
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