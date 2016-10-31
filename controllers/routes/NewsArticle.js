/**
 * NewsArticle.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-10-29 10:42pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var NewsArticle = require('./../../models/NewsArticle');

/**
 * Route: /newsarticles/list
 *
 * Description	: This route function will render the list view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-10-29 10:44pm
 */
router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'newsarticle/list', {
				title: 'News Article Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'newsarticle/list', {
				title: 'News Article Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'newsarticle/list', {
				title: 'News Article Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /newsarticles/create
 *
 * Description	: This route function will render the create view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-10-29 10:46pm
 */
router.get('/create', function(request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'newsarticle/create', {
				title: 'Add New Article',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('newsarticle/create', {
				title: 'Add New Article',
				baseUri: config.baseUri,
				show_info: 'Record created.',
				article_title: request.query.article,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'newsarticle/create', {
				title: 'Add News Article',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /newsarticles/edit/?id=[articleId]
 *
 * Description	: This route function will render the edit view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-10-29 10:47pm
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		NewsArticle.findOne({_id: request.query.id}, function (error, newsArticle) {
			if (request.query.error) {
				response.render('newsarticle/edit', {
					title: 'Edit News Article',
					baseUri: config.baseUri,
					show_error: 'Error occured.',
					newsArticle: newsArticle,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('newsarticle/edit', {
					title: 'Edit News Article',
					baseUri: config.baseUri,
					show_info: 'Record Updated.',
					newsArticle: newsArticle,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('newsarticle/edit', {
					title: 'Edit News Article',
					baseUri: config.baseUri,
					newsArticle: newsArticle,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

module.exports = router;