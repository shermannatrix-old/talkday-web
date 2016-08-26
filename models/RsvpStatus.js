'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var UserEventRsvp = require('./UserEventRsvp');

/**
 * The RsvpStatus schema will store values for the different types of RSVP statuses (e.g. Maybe, Attending).
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var rsvpStatusSchema = new mongoose.Schema({
	_userEventRsvps	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'UserEventRsvp' } ],
	statusName		: { type: String }
});

module.exports = mongoose.model('RsvpStatus', rsvpStatusSchema);