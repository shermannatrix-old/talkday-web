/**
 * The EventVenue.js controller will contain methods for creating new Event Venues and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 6:59pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventVenue = require('./../../models/EventVenue');

router.get('/get_list_selection', function(request, response) {
	EventVenue.find({}, function(error, eventVenues) {
		return response.json(eventVenues).status(200).end();
	});
});

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
			response.redirect('/eventvenues/create/?created=1');
	});
});

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

module.exports = router;