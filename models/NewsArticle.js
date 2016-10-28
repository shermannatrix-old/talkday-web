'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema();

/**
 * The News Article schema will store values for all the latest news updates created by the Talkday Management Team.
 * Created by		: Sherman Chen
 * Date Created		: 2016-10-28 02:35pm
 */
var newsArticleSchema = new mongoose.Schema({
	articleTitle	: { type: String },
	articleSummary	: { type: String },
	articleContent	: { type: String },
	dateCreated		: { type: Date, default: Date.now() },
	dateModified	: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('NewsArticle', newsArticleSchema);