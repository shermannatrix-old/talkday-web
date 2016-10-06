/**
 * EventVenue.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-26 01:53pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');

/**
 * Route: /events/create
 *
 * Description	: This route function will render the create view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-26 03:14pm
 */
router.get('/create', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'event/create', {
				title: 'Add Event',
				baseUri: config.baseUri,
				googleApiKey: config.googleJsApiKey,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('event/create', {
				title: 'Add Event',
				baseUri: config.baseUri,
				googleApiKey: config.googleJsApiKey,
				show_info: 'Record created.',
				event_name: request.query.event,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'event/create', {
				title: 'Add Event',
				baseUri: config.baseUri,
				googleApiKey: config.googleJsApiKey,
				fullname: request.cookies.fullname
			});
		}
	}
});

/**
 * Route: /events/edit/?id=[eventId]
 *
 * Description	: This route function will render the edit view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-26 01:55pm
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		Event.findOne({_id: request.query.id}).populate('_eventType _eventCategory _eventStatus _eventVenue').exec( function (error, event) {
			if (request.query.error) {
				response.render('event/edit', {
					title: 'Edit Event',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					show_error: 'Error occured.',
					event: event,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('event/edit', {
					title: 'Edit Event',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					show_info: 'Record Updated.',
					event: event,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('event/edit', {
					title: 'Edit Event',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					event: event,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /events/dashboard/
 *
 * Description	: This route function will render the edit view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-26 04:53pm
 */
router.get('/dashboard', function(request, response) {
	if (request.cookies.fullname) {
			if (request.query.error) {
				response.render('event/dashboard', {
					title: 'Events Dashboard',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					show_error: 'Error occured.',
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('event/dashboard', {
					title: 'Events Dashboard',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					show_info: 'Record Updated.',
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('event/dashboard', {
					title: 'Events Dashboard',
					baseUri: config.baseUri,
					googleApiKey: config.googleJsApiKey,
					fullname: request.cookies.fullname
				});
			}
	}
	else
		response.redirect('/users/login');
});

module.exports = router;