/**
 * The EventSpeaker.js controller will contain methods for creating new Event Speakers and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-09-07 6:58pm
 * Date Modified	: 2016-09-29 08:41pm
 * ===============================================================================================================
 * Update Log:
 * (1) /update_speaker_details API method has been added.
 */

'use strict';

var express = require('express');
var router = express.Router();
var assert = require('assert');

var config = require('./../../config/config');
var Event = require('./../../models/Event');
var EventSpeaker = require('./../../models/EventSpeaker');

var fs = require('fs'),
	path = require('path'),
	busboy = require('connect-busboy');

router.use(busboy());

router.get('/get_all_speakers', function (request, response) {
	EventSpeaker.find({}).populate('_events').exec(function (error, speakers) {
		return response.json(speakers).status(200).end();
	});
});

router.get('/get_list_selection', function(request, response) {
	EventSpeaker.find({}, function(error, speakers) {
		return response.json(speakers).status(200).end();
	});
});

/**
 * /add_speaker - this API method will create a new Speaker Profile document
 * Http Method			: POST
 * Created By			: Sherman Chen
 * Date Created			: 2016-09-29 08:29pm
 */
router.post('/add_speaker', function (request, response) {
	var modeType = request.query.mode;
	
	var fstream;
	var filePath;
	var fileName;
	
	var currDate = new Date().getUTCDate().toString();
	var currMonth = new Date().getUTCMonth().toString();
	var currYear = new Date().getUTCFullYear().toString();
	
	var eventSpeaker = new EventSpeaker();
	var eventId;
	
	if (request.query.event) {
		eventId = request.query.event;
		eventSpeaker._events.push(eventId);
	}
	
	request.pipe(request.busboy);
	request.busboy.on('file', function (fieldname, file, filename) {
		
		filePath = path.join(__dirname, '../../public/uploads/speakers/', currYear + '-' + currMonth + '-' + currDate + '-' + filename);
		eventSpeaker.speakerPhoto = config.baseUri + 'uploads/speakers/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename;
		
		console.log('{ filePath: ' + filePath + ', fileName: ' + config.baseUri + 'uploads/speakers/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename + ' }');
		
		fstream = fs.createWriteStream(filePath);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log('Photo Uploaded');
		});
	});
	
	request.busboy.on('field', function(fieldName, value) {
		console.log('Field name: ' + fieldName.toString() + ', value: ' + value.toString());
		
		if (fieldName.toString() == 'speakerName')
			eventSpeaker.speakerName = value.toString();
		else if (fieldName.toString() == 'speakerBio')
			eventSpeaker.speakerBio = value.toString();
		else if(fieldName.toString() == 'fieldsOfInterests')
			eventSpeaker.fieldsOfInterests = value.toString();
		else if (fieldName.toString() == 'topicTitle')
			eventSpeaker.topicTitle = value.toString();
		else if (fieldName.toString() == 'topicDesc')
			eventSpeaker.topicDesc = value.toString();
	});
	
	console.log('Speaker: ' + JSON.stringify(eventSpeaker));
	
	eventSpeaker.save(function (saveSpeakerError) {
		if (saveSpeakerError) {
			return response.json({Error: 'Error adding new event speaker record.', OfficialError: saveSpeakerError.toString(), dataPassed: eventSpeaker}).status(500).end();
		}
			
		if (eventId) {
			Event.findOne({_id: eventId}, function (retEventError, event) {
				if (retEventError) {
					return response.json({Error: 'Error retrieving event record.', OfficialError: error.toString()}).status(500).end();
				}
					
				event._speakers.push(speaker);
				event.save();
			});
		}
			
		if (modeType == 'cms')
			response.redirect('/eventspeakers/create/?speaker=' + eventSpeaker.speakerName + '&created=1');
		else
			return response.json(eventSpeaker).status(201).end();
	});
});

/**
 * /update_speaker_details - this API method will update the speaker's details and also remove past references in the _events collection.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-09-29 10:26am
 * Date Modified	: 2016-09-29 08:36pm
 * ===============================================================================================================
 * Update Log:
 * (1) Remove the newEvent condition block.
 */
router.post('/update_speaker_details', function (request, response) {
	var modeType = request.query.mode;
	
	var fstream;
	var filePath;
	var fileName;
	
	var currDate = new Date().getUTCDate().toString();
	var currMonth = new Date().getUTCMonth().toString();
	var currYear = new Date().getUTCFullYear().toString();
	
	var updateData = {};
	var speakerId = request.query.id;
	var eventId;
	
	if (request.query.event)
		eventId = request.query.event;
	
	EventSpeaker.findOne({ _id: speakerId }).populate('_events').exec(function (error, speakerDetails) {
		if (error) {
			if (modeType == 'cms')
				return response.redirect('/eventspeakers/edit/?id=' + speakerId + '&error=1');
			else
				return response.json({ErrorDesc: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
		}
		
		request.pipe(request.busboy);
		request.busboy.on('file', function (fieldname, file, filename) {
			
			filePath = path.join(__dirname, '../../public/uploads/speakers/', currYear + '-' + currMonth + '-' + currDate + '-' + filename);
			speakerDetails.speakerPhoto = config.baseUri + 'uploads/speakers/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename;
			
			console.log('{ filePath: ' + filePath + ', fileName: ' + config.baseUri + 'uploads/speakers/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename + ' }');
			
			fstream = fs.createWriteStream(filePath);
			file.pipe(fstream);
			fstream.on('close', function () {
				console.log('Photo Uploaded');
			});
		});
		
		// Get values from all the drop down lists and textfields
		request.busboy.on('field', function(key, value) {
			
			if (key.toString() == 'speakerName')
				speakerDetails.speakerName = value.toString();
			else if (key.toString() == 'speakerBio')
				speakerDetails.speakerBio = value.toString();
			else if(key.toString() == 'fieldsOfInterests')
				speakerDetails.fieldsOfInterests = value.toString();
			else if (key.toString() == 'topicTitle')
				speakerDetails.topicTitle = value.toString();
			else if (key.toString() == 'topicDesc')
				speakerDetails.topicDesc = value.toString();
			/*else if (key.toString() == 'newEvent') {
				// If an old event is detected via the query string...
				if (eventId)
				{
					// Look for the matching event and then remove it from the collection.
					speakerDetails._events.forEach(function (event, index) {
						if (event._id == eventId)
							speakerDetails._events.removeAt(index);
					});
					
					// Let's add the new event to the speaker's list of events.
					speakerDetails._events.push(value.toString());
					
					// For the selected new Event, add the speaker and save it.
					Event.findOne({_id: value.toString() }).populate('_speakers').exec(function (findEventErr, eventDetails) {
						eventDetails._speakers.push(speakerDetails);
					});
					
					// Using the event _id provided in the query string, remove the matching speaker from the _speakers collection.
					Event.findOne({_id: eventId}).populate('_speakers').exec(function (findEventErr, eventDetails) {
						eventDetails._speakers.forEach(function(speaker, index) {
							if (speaker._id == speakerDetails._id)
							{
								eventDetails._speakers.removeAt(index);
							}
						});
						
						eventDetails.save();
					});
				}
			}*/
		});
		
		speakerDetails.save();
		
		if (modeType == 'cms') {
			response.redirect('/eventspeakers/edit/?id=' + speakerDetails._id + '&mode=cms&updated=1')
		}
	});
});

module.exports = router;