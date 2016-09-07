'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Event = require('./Event');

/**
 * The EventSpeaker schema will store values for the different speakers who have spoken at various events.
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var eventSpeakerSchema = new mongoose.Schema({
	// The events the speaker has participated in before.
	_events				: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ],
	speakerPhoto		: { type: String },
	speakerName			: { type: String },
	speakerBio			: { type: String },
	fieldsOfInterests	: { type: String },		// a speaker might be capable in multiple fields, i.e. NodeJS, JavaScript, etc
	topicTitle			: { type: String },
	topicDesc			: { type: String }
});

module.exports = mongoose.model('EventSpeaker', eventSpeakerSchema);