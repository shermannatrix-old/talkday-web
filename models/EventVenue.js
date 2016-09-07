'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Event = require('./Event');

/**
 * The EventVenue schema will store values of venues for each event.
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var eventVenueSchema = new mongoose.Schema({
	venueName		: { type: String, unique: true },
	buildingName	: { type: String },
	buildingNo		: { type: String },
	streetAddr		: { type: String },
	unitNo			: { type: String },
	postalCode		: { type: String },
	longitude		: { type: Number },
	latitude		: { type: Number },
	_events			: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ]	// All the events that have been held at this venue.
});

module.exports = mongoose.model('EventVenue', eventVenueSchema);