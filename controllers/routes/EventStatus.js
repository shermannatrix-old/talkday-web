/**
 * EventStatus.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 12:15pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var EventStatus = require('./../../models/EventStatus');

/**
 * Route: /eventstatus/list
 *
 * Description	: This route function will render the list view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 12:15pm
 */
router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventstatus/list', {
				title: 'Event Status Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'eventstatus/list', {
				title: 'Event Status Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'eventstatus/list', {
				title: 'Event Status Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventstatus/create
 *
 * Description	: This route function will render the create view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 12:15pm
 */
router.get('/create', function(request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'eventstatus/create', {
				title: 'Add Event Status',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('eventstatus/create', {
				title: 'Add Event Status',
				baseUri: config.baseUri,
				show_info: 'Record created.',
				status_name: request.query.status,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'eventstatus/create', {
				title: 'Add Event Status',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventstatus/edit/?id=[eventStatusId]
 *
 * Description	: This route function will render the edit view for the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 12:15pm
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		EventStatus.findOne({_id: request.query.id}, function (error, eventStatus) {
			if (request.query.error) {
				response.render('eventstatus/edit', {
					title: 'Edit Event Status',
					baseUri: config.baseUri,
					show_error: 'Error occured.',
					eventStatus: eventStatus,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('eventstatus/edit', {
					title: 'Edit Event Status',
					baseUri: config.baseUri,
					show_info: 'Record Updated.',
					eventStatus: eventStatus,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('eventstatus/edit', {
					title: 'Edit Event Status',
					baseUri: config.baseUri,
					eventStatus: eventStatus,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

module.exports = router;