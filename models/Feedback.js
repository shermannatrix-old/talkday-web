'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Event = require('./Event');
var FeedbackStatus = require('./FeedbackStatus');
var User = require('./User');

/**
 * The Feedback schema will store values for all the feedbacks provided by users of the app.
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var feedbackSchema = new mongoose.Schema({
	_event			: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
	feedbackContent	: { type: String },
	rating			: { type: Number },
	dateAdded		: { type: Date, default: Date.now() },
	_feedbackStatus	: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackStatus'},
	_user			: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Feedback', feedbackSchema);