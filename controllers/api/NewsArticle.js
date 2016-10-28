/**
 * The NewsArticle.js controller will contain methods for creating new News Articles and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-10-28 02:54pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var NewsArticle = require('./../../models/NewsArticle');

/**
 * /create_new_article - this API method will add a new news article document.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-28 03:05pm
 */
router.post('/create_new_article', function (request, response) {
	var modeType = request.query.mode;

	var newArticle = new NewsArticle({
		articleTitle	: request.body.articleTitle,
		articleSummary	: request.body.articleSummary,
		articleContent	: request.body.articleContent
	});

	newArticle.save(function (error) {
		if (error) {
			if (modeType != 'cms') {
				return response.json({ErrorMessage: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			}
			else {
				response.redirect('/newsarticles/create/?error=1');
			}
		}

		if (modeType != 'cms') {
			return response.json(newArticle).status(201).end();
		}
		else {
			response.redirect('/newsarticle/create/?created=1');
		}
	});
});

module.exports = router;