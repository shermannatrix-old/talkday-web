'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var User = require('./User');

/**
 * The UserType schema will store values for the User Roles for differentiating the users when they log in.
 * Created by: Sherman Chen
 * Date Added: 26-08-2016
 */
var userTypeSchema = new mongoose.Schema({
	_users		: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
	typeName	: { type: String }
});

module.exports = mongoose.model('UserType', userTypeSchema);