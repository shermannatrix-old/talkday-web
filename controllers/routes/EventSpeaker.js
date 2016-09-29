/**
 * EventSpeaker.js (Route Controller)
 *
 * Description	: This controller serves as a route controller for render the relevant views depending on the URL provided to the web browser.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-29 11:06am
 */

'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var EventSpeaker = require('./../../models/EventSpeaker');
var Event = require('./../../models/Event');

/**
 * Route: /eventspeakers/list
 *
 * Description	: This route function will render the list view for Event Speakers in the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-29 11:07am
 */
router.get('/list', function (request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'speaker/list', {
				title: 'Event Speakers Listing',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.deleted) {
			response.render ( 'speaker/list', {
				title: 'Event Speakers Listing',
				baseUri: config.baseUri,
				show_info: 'Record deleted.',
				fullname: request.cookies.fullname
			} );
		}
		else {
			response.render ( 'speaker/list', {
				title: 'Event Speakers Listing',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventspeakers/create
 *
 * Description	: This route function will render the create view for the Event Speaker module in the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-29 11:10am
 */
router.get('/create', function(request, response) {
	if (request.cookies.fullname) {
		if ( request.query.error ) {
			response.render ( 'speaker/create', {
				title: 'Add Event Speaker',
				baseUri: config.baseUri,
				show_error: 'Error occured.',
				fullname: request.cookies.fullname
			} );
		}
		else if (request.query.created) {
			response.render('speaker/create', {
				title: 'Add Event Speaker',
				baseUri: config.baseUri,
				show_info: 'Record created.',
				speaker_name: request.query.speaker,
				fullname: request.cookies.fullname
			});
		}
		else {
			response.render ( 'speaker/create', {
				title: 'Add Event Speaker',
				baseUri: config.baseUri,
				fullname: request.cookies.fullname
			});
		}
	}
	else
		response.redirect('/users/login');
});

/**
 * Route: /eventspeakers/edit/?id=[speakerId]
 *
 * Description	: This route function will render the edit view for the Event Speaker module in the CMS.
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-29 11:12am
 */
router.get('/edit', function(request, response) {
	if (request.cookies.fullname) {
		EventSpeaker.findOne({_id: request.query.id}).populate('_events').exec( function (error, speaker) {
			if (request.query.error) {
				response.render('speaker/edit', {
					title: 'Edit Event Speaker',
					baseUri: config.baseUri,
					show_error: 'Error occured.',
					speakerDetails: speaker,
					fullname: request.cookies.fullname
				});
			}
			else if (request.query.updated) {
				response.render('speaker/edit', {
					title: 'Edit Event Speaker',
					baseUri: config.baseUri,
					show_info: 'Record Updated.',
					speakerDetails: speaker,
					fullname: request.cookies.fullname
				});
			}
			else {
				response.render('speaker/edit', {
					title: 'Edit Event Speaker',
					baseUri: config.baseUri,
					speakerDetails: speaker,
					fullname: request.cookies.fullname
				});
			}
		});
	}
	else
		response.redirect('/users/login');
});

module.exports = router;