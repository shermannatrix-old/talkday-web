'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var User = require('./User');
var Event = require('./Event');
var RsvpStatus = require('./RsvpStatus');

/**
 * The UserEventRsvp schema will store values for the different types of RSVPs made by Users.
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var userEventRsvpSchema = new mongoose.Schema({
	_user		: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	_event		: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
	_rsvpStatus	: { type: mongoose.Schema.Types.ObjectId, ref: 'RsvpStatus' }
});

module.exports = mongoose.model('UserEventRsvp', userEventRsvpSchema);