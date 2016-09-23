/**
 * EventType.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 01:42pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var EventType = require('./../../models/EventType');

/**
 * Route: /eventtypes/list
 *
 * Description	: This route function will render the list view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 01:43pm
 */
router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventtype/list', {
				title: 'Event Type Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'eventtype/list', {
				title: 'Event Type Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'eventtype/list', {
				title: 'Event Type Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventtypes/create
 *
 * Description	: This route function will render the create view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 02:33pm
 */
router.get('/create', function(request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventtype/create', {
				title: 'Add Event Type',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('eventtype/create', {
				title: 'Add Event Type',
				baseUri: config.baseUri,
				show_info: 'Record created.',
				type_name: request.query.typeName,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'eventtype/create', {
				title: 'Add Event Type',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventtypes/edit/?id=[eventTypeId]
 *
 * Description	: This route function will render the edit view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-23 02:35pm
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		EventType.findOne({_id: request.query.id}, function (error, eventType) {
			if (request.query.error) {
				response.render('eventtype/edit', {
					title: 'Edit Event Type',
					baseUri: config.baseUri,
					show_error: 'Error occured.',
					eventType: eventType,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('eventtype/edit', {
					title: 'Edit Event Type',
					baseUri: config.baseUri,
					show_info: 'Record Updated.',
					eventType: eventType,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('eventtype/edit', {
					title: 'Edit Event Type',
					baseUri: config.baseUri,
					eventType: eventType,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

module.exports = router;