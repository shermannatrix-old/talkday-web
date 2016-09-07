/**
 * The EventCategory.js controller will contain methods for creating new Event Categories and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 6:57pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventCategory = require('./../../models/EventCategory');

router.get('/get_list_selection', function(request, response) {
	EventCategory.find({}, function(error, eventCategories) {
		return response.json(eventCategories).status(200).end();
	});
});

router.post('/create_event_category', function (request, response) {
	var eventCategory = new EventCategory({
		categoryName: request.body.categoryName
	});
	
	eventCategory.save(function(error) {
		if (error) {
			if (request.query.mobile)
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventcategories/create/?error=1');
		}
		
		if (request.query.mobile)
			return response.json(eventCategory).status(201).end();
		else
			response.redirect('/eventcategories/create/?created=1');
	});
});

module.exports = router;