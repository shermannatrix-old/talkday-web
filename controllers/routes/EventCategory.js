/**
 * EventCategory.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 04:37pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var EventCategory = require('./../../models/EventCategory');

/**
 * Route: /eventcategories/list
 *
 * Description	: This route function will render the list view for Event Categories in the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 04:26pm
 */
router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventcategory/list', {
				title: 'Event Category Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'eventcategory/list', {
				title: 'Event Category Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'eventcategory/list', {
				title: 'Event Category Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventcategories/create
 *
 * Description	: This route function will render the create view for the Event Category module in the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 04:29pm
 */
router.get('/create', function(request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventcategory/create', {
				title: 'Add Event Category',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('eventcategory/create', {
				title: 'Add Event Category',
				baseUri: config.baseUri,
				show_info: 'Record created.',
				category_name: request.query.category,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'eventcategory/create', {
				title: 'Add Event Category',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventcategories/edit/?id=[eventCategoryId]
 *
 * Description	: This route function will render the edit view for the Event Category module in the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 04:35pm
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		EventCategory.findOne({_id: request.query.id}, function (error, eventCategory) {
			if (request.query.error) {
				response.render('eventcategory/edit', {
					title: 'Edit Event Category',
					baseUri: config.baseUri,
					show_error: 'Error occured.',
					eventCategory: eventCategory,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('eventcategory/edit', {
					title: 'Edit Event Category',
					baseUri: config.baseUri,
					show_info: 'Record Updated.',
					eventCategory: eventCategory,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('eventcategory/edit', {
					title: 'Edit Event Category',
					baseUri: config.baseUri,
					eventCategory: eventCategory,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

module.exports = router;