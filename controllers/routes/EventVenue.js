/**
 * EventVenue.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 03:56pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var EventVenue = require('./../../models/EventVenue');

/**
 * Route: /eventvenues/list
 *
 * Description	: This route function will render the list view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 03:44pm
 */
router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventvenue/list', {
				title: 'Event Venue Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'eventvenue/list', {
				title: 'Event Venue Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'eventvenue/list', {
				title: 'Event Venue Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventvenues/create
 *
 * Description	: This route function will render the create view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 03:46pm
 */
router.get('/create', function(request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventvenue/create', {
				title: 'Add Event Venue',
				baseUri: config.baseUri,
				googleApiKey: config.googleJsApiKey,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('eventvenue/create', {
				title: 'Add Event Venue',
				baseUri: config.baseUri,
				googleApiKey: config.googleJsApiKey,
				show_info: 'Record created.',
				venue_name: request.query.venue,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'eventvenue/create', {
				title: 'Add Event Venue',
				baseUri: config.baseUri,
				googleApiKey: config.googleJsApiKey,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventvenues/edit/?id=[eventVenueId]
 *
 * Description	: This route function will render the edit view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 03:55pm
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		EventVenue.findOne({_id: request.query.id}, function (error, eventVenue) {
			if (request.query.error) {
				response.render('eventvenue/edit', {
					title: 'Edit Event Venue',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					show_error: 'Error occured.',
					eventVenue: eventVenue,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('eventvenue/edit', {
					title: 'Edit Event Venue',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					show_info: 'Record Updated.',
					eventVenue: eventVenue,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('eventvenue/edit', {
					title: 'Edit Event Venue',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					eventVenue: eventVenue,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

module.exports = router;