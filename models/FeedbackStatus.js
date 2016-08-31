'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Feedback = require('./Feedback');

/**
 * The FeedbackStatus schema will store values for the different types of feedback statuses (e.g. Pending, Approved, etc).
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var feedbackStatusSchema = new mongoose.Schema({
	_feedbacks	: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' } ],
	statusName	: { type: String }
});

module.exports = mongoose.model('FeedbackStatus', feedbackStatusSchema);