'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var EventType = require('./EventType');
var EventCategory = require('./EventCategory');
var EventVenue = require('./EventVenue');
var EventSpeaker = require('./EventSpeaker');
var Feedback = require('./Feedback');
var UserEventRsvp = require('./UserEventRsvp');
var EventStatus = require('./EventStatus');

/**
 * The Event schema will store values for all the events in a particular area.
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 * Date Updated	: 2016-09-07 7:06pm
 */
var eventSchema = new mongoose.Schema({
	eventName		: { type: String },
	eventDesc		: { type: String },
	startDate		: { type: Date, default: Date.now() },
	endDate			: { type: Date, default: Date.now() },
	startTime		: { type: String },
	endTime			: { type: String },
	isAllDay		: { type: Boolean, default: false },
	_eventStatus	: { type: mongoose.Schema.Types.ObjectId, ref: 'EventStatus'},
	_eventType		: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' },
	_eventCategory	: { type: mongoose.Schema.Types.ObjectId, ref: 'EventCategory' },
	_eventVenue		: { type: mongoose.Schema.Types.ObjectId, ref: 'EventVenue' },
	_speakers		: [ { type: mongoose.Schema.Types.ObjectId, ref: 'EventSpeaker' } ],			// Some events are known to have multiple speakers
	_feedbacks		: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' } ],		// All feedbacks submitted that are related to the event.
	_userEventRsvps	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'UserEventRsvp' } ]		// related to the number of users who have RSVPed for each event.
});

module.exports = mongoose.model('Event', eventSchema);