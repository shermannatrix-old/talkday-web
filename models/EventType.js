'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Event = require('./Event');

/**
 * The EventType schema will store values for the different types of Events (e.g. Conferences, Meet-ups, etc).
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var eventTypeSchema = new mongoose.Schema({
	_events		: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ],
	typeName	: { type: String }
});

module.exports = mongoose.model('EventType', eventTypeSchema);