'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var UserPost = require('./UserPost');
var UserType = require('./UserType');
var UserEventRsvp = require('./UserEventRsvp');
var Feedback = require('./Feedback');

var userSchema = new mongoose.Schema({
	username			: { type: String, unique: true, lowercase: true },
	password			: { type: String },
	email				: { type: String, unique: true },
	firstName			: { type: String },
	lastName			: { type: String },
	mobileNo			: { type: String, default: '' },
	mobileDeviceToken	: { type: String, default: '' },
	profilePic			: { type: String, default: 'no_photo.png'},
	_userType			: { type: mongoose.Schema.Types.ObjectId, ref: 'UserType' },			// Either 'Normal User', or 'Administrator'
	_userPosts			: [ { type: mongoose.Schema.Types.ObjectId, ref: 'UserPost' } ],		// All the user's wall feeds
	_userEventRsvps		: [ { type: mongoose.Schema.Types.ObjectId, ref: 'UserEventRsvp' } ],	// All the Events the user has RSVPed for.
	_feedbacks			: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' } ]			// All feedbacks submitted by the user.
});

module.exports = mongoose.model('User', userSchema);