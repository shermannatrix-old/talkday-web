'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var Event = require('./Event');

/**
 * The EventCategory schema will store values for the different category of Events (e.g. .NET, Java, NodeJS, etc).
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var eventCategorySchema = new mongoose.Schema({
	_events			: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } ],
	colorCode		: { type: String },
	categoryName	: { type: String }
});

module.exports = mongoose.model('EventCategory', eventCategorySchema);