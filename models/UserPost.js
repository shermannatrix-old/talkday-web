'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var User = require('./User');

var userPostSchema = new mongoose.Schema({
	_user		: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	textUpdate	: { type: String, nullable: true },
	photoUpdate	: { type: String, nullable: true },
	videoUpdate	: { type: String, nullable: true },
	datePosted	: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('UserPost', userPostSchema);