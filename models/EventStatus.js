'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Event = require('./Event');

/**
 * The EventStatus schema will store values for the different types of event statuses (e.g. Pending, Approved, Canceled etc).
 * Created by: Sherman Chen
 * Date Added: 07-09-2016 7:05pm
 */
var eventStatusSchema = new mongoose.Schema({
	_events		: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ],
	statusName	: { type: String }
});

module.exports = mongoose.model('EventStatus', eventStatusSchema);