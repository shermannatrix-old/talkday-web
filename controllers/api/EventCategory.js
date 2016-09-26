/**
 * The EventCategory.js controller will contain methods for creating new Event Categories and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-07 6:57pm
 * Date Modified	: 2016-09-22 05:32pm
 * ==================================================================
 * Update Log:
 * (1) Added /get_list
 * (2) Added /update_event_category
 * (3) Added /delete_category
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventCategory = require('./../../models/EventCategory');

/**
 * /get_list - this method will retrieve all the Event Category documents along with all the related Event documents.
 *
 * Created By	: Sherman Chen
 * Date Created	: 2016-09-22 04:12pm
 */
router.get('/get_list', function (request, response) {
	EventCategory.find({}).populate('_events').sort({categoryName: 1}).exec(function (error, eventCategories) {
		return response.json(eventCategories).status(200).end();
	});
});

/**
 * /get_list_selection - this method will retrieve only the Event Category documents for selection purposes.
 *
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-07 06:57pm
 */
router.get('/get_list_selection', function(request, response) {
	EventCategory.find({}, function(error, eventCategories) {
		return response.json(eventCategories).status(200).end();
	});
});

/**
 * /create_event_category - this method will add a new Event Category document.
 * HTTP Method		: POST
 *
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-07 06:57pm
 * Date Updated	: 2016-09-26 03:35pm
 * ===============================================================================================================
 * Update Log:
 * (1) Added the colorCode property for the Event Category class.
 */
router.post('/create_event_category', function (request, response) {
	var modeType = request.query.mode;
	
	var eventCategory = new EventCategory({
		categoryName: request.body.categoryName,
		colorCode: request.body.colorCode
	});
	
	eventCategory.save(function(error) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventcategories/create/?error=1');
		}
		
		if (modeType != 'cms')
			return response.json(eventCategory).status(201).end();
		else
			response.redirect('/eventcategories/create/?created=1&category=' + eventCategory.categoryName);
	});
});

/**
 * /update_event_category - this method take the categoryName that is provided and update the record with the specified category _id.
 * HTTP Method	: POST
 * Created By	: Sherman Chen
 * Date Created	: 2016-09-22 04:19pm
 * Date Updated	: 2016-09-26 03:35pm
 * ===============================================================================================================
 * Update Log:
 * (1) Added the colorCode property for the Event Category class.
 */
router.post('/update_event_category', function (request, response) {
	var modeType = request.query.mode,		// Is the request coming from the CMS, frontend website or mobile app?
		categoryId = request.query.id;		// The Event Category's _id value.
	
	var updateData = {
		categoryName: request.body.categoryName,
		colorCode: request.body.colorCode
	};
	
	var query = {
		_id: categoryId
	};
	
	EventCategory.findOneAndUpdate (query, updateData, {new: true}, function (error, updatedCategory) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			else
				response.redirect('/eventcategories/edit/?id=' + categoryId + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json(updatedCategory).status(200).end();
		else
			response.redirect('/eventcategories/edit/?id=' + categoryId + '&updated=1');
	});
});

/**
 * /delete_category - this method will delete a single Event Category record.
 * HTTP Method	: GET
 *
 * Created by	: Sherman Chen
 * Date Created	: 2016-09-22 05:32pm
 */
router.get('/delete_category', function (request, response) {
	var modeType = request.query.mode;
	
	EventCategory.findOneAndRemove({_id: request.query.id}, function(error, eventCategory) {
		if (error) {
			if (modeType != 'cms')
				return response.json({Error: error.toString(), Stack: error.stack.toString()}).status(200).end();
			else
				response.redirect('/eventcategories/list/?id=' + request.query.id + '&error=1');
		}
		
		if (modeType != 'cms')
			return response.json({message: 'Event Category has been deleted.'}).status(200).end();
		else
			response.redirect('/eventcategories/list/?deleted=1');
	});
});

module.exports = router;