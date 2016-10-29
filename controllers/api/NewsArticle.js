/**
 * The NewsArticle.js controller will contain methods for creating new News Articles and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-10-28 02:54pm
 * Date Modified	: 2016-10-29 10:41pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var NewsArticle = require('./../../models/NewsArticle');

/**
 * /get_all_articles - this API method will return all the News Article documents.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-29 10:40pm
 */
router.get('/get_all_articles', function (request, response) {
	NewsArticle.find({}, function (error, newsArticles) {
		return response.json(newsArticles).status(200).end();
	});
});

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

/**
 * /update_article_details - this API method will update the details of a selected News Article document.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-29 10:37pm
 */
router.post('/update_article_details', function (request, response) {
	var modeType = request.query.mode,
		articleId = request.query.id;

	NewsArticle.findOne({_id: articleId}, function (getArticleError, newsArticleDetails) {
		if (getArticleError) {
			if (modeType != 'cms') {
				return response.json({ErrorMessage: getArticleError.toString(), ErrorStack: getArticleError.stack.toString()}).status(500).end();
			}
			else {
				response.redirect('/newsarticle/edit/?id=' + articleId + '&error=1');
			}
		}

		newsArticleDetails.articleTitle = request.body.articleTitle;
		newsArticleDetails.articleSummary = request.body.articleSummary;
		newsArticleDetails.articleContent = request.body.articleContent;
		newsArticleDetails.dateModified = Date.now();

		newsArticleDetails.save();

		if (modeType != 'cms') {
			return response.json(newsArticleDetails).status(201).end();
		}
		else {
			response.redirect('/newsarticle/edit/?id=' + articleId + '&updated=1');
		}
	});


});

module.exports = router;