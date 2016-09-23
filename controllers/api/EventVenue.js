/**
 * The EventVenue.js controller will contain methods for creating new Event Venues and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-07 06:59pm
 * Date Modified	: 2016-09-23 03:30pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventVenue = require('./../../models/EventVenue');

/**
 * /get_list - this API method will retrieve all the Event Venue documents including the related Events.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-23 03:32pm
 */
router.get('/get_list', function (request, response) {
	EventVenue.find({}).populate('_events').exec(function (error, eventVenues) {
		return response.json(eventVenues).status(200).end();
	});
});

/**
 * /get_list_selection - this API method will retrieve all the Event Venue documents for selection purposes.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 06:59pm
 */
router.get('/get_list_selection', function(request, response) {
	EventVenue.find({}, function(error, eventVenues) {
		return response.json(eventVenues).status(200).end();
	});
});

/**
 * /create_venue - this API method will create a new Event Venue document.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 06:59pm
 */
router.post('/create_venue', function (request, response) {
	var eventVenue = new EventVenue({
		venueName		: request.body.venueName,
		buildingName	: request.body.buildingName,
		buildingNo		: request.body.buildingNo,
		streetAddr		: request.body.streetAddr,
		unitNo			: request.body.unitNo,
		postalCode		: request.body.postalCode,
		longitude		: request.body.longitude,
		latitude		: request.body.latitude
	});
	
	eventVenue.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventvenues/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(eventVenue).status(201).end();
		else
			response.redirect('/eventvenues/create/?created=1&venue=' + eventVenue.venueName);
	});
});

/**
 * /update_venue - this API method will update an existing Event Venue document.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-07 06:59pm
 */
router.post('/update_venue', function (request, response) {
	var eventVenue = {
		venueName		: request.body.venueName,
		buildingName	: request.body.buildingName,
		buildingNo		: request.body.buildingNo,
		streetAddr		: request.body.streetAddr,
		unitNo			: request.body.unitNo,
		postalCode		: request.body.postalCode,
		longitude		: request.body.longitude,
		latitude		: request.body.latitude
	};
	
	var query = {
		_id: request.query.id
	};
	
	EventVenue.findOneAndUpdate(query, eventVenue, {new: true}, function(error, venueDetails) {
		if ( error ) {
			if ( request.query.mobile )
				return response.json ( { Error: error.toString () } ).status ( 500 ).end ();
			else
				response.redirect ( '/eventvenues/edit/?id=' + request.query.id + '&error=1' );
		}
		
		if (request.query.mobile)
			return response.json(venueDetails).status(200).end();
		else
			response.redirect('/eventvenues/edit?id=' + request.query.id + '&updated=1');
	});
});

/**
 * /delete_venue - this API method will remove a single Event Venue record.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-23 03:35pm
 */
router.get('/delete_venue', function(request, response) {
	var modeType = request.query.mode,
		venueId = request.query.id;
	
	EventVenue.findOneAndRemove({_id: venueId}, function(error, eventVenue) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), Stack: error.stack.toString()}).status(200).end();
			else
				response.redirect('/eventvenues/list/?id=' + request.query.id + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json({message: 'Event Venue has been deleted.'}).status(200).end();
		else
			response.redirect('/eventvenues/list/?deleted=1');
	});
});

module.exports = router;