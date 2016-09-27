/**
 * The EventSpeaker.js controller will contain methods for creating new Event Speakers and also retrieving those values for listing purposes.
 * Created by: Sherman
 * Updated on: 2016-09-07 6:58pm
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

router.get('/get_list_selection', function(request, response) {
	RsvpStatus.find({}, function(error, rsvpStatuses) {
		return response.json(rsvpStatuses).status(200).end();
	});
});

router.post('/add_speaker', function (request, response) {
	var fstream;
	var filePath;
	var fileName;
	
	var currDate = new Date().getUTCDate().toString();
	var currMonth = new Date().getUTCMonth().toString();
	var currYear = new Date().getUTCFullYear().toString();
	
	var speaker = new EventSpeaker();
	var eventId;
	
	request.pipe(request.busboy);
	request.busboy.on('file', function (fieldname, file, filename) {
		
		filePath = path.join(__dirname, '../../public/uploads/speakers/', currYear + '-' + currMonth + '-' + currDate + '-' + filename);
		speaker.speakerPhoto = config.baseUri + 'uploads/speakers/' + currYear + '-' + currMonth + '-' + currDate + '-' + filename;
		
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
			speaker.speakerName = value.toString();
		else if (key.toString() == 'speakerBio')
			speaker.speakerBio = value.toString();
		else if(key.toString() == 'fieldsOfInterests')
			speaker.fieldsOfInterests = value.toString();
		else if (key.toString() == 'topicTitle')
			speaker.topicTitle = value.toString();
		else if (key.toString() == 'topicDesc')
			speaker.topicDesc = value.toString();
		else if (key.toString() == 'event') {
			eventId = value.toString();
			speaker._events.push(value.toString());
		}
		
	});
	
	speaker.save(function (saveSpeakerError) {
		if (saveSpeakerError) {
			return response.json({Error: 'Error adding new event speaker record.', OfficialError: error.toString(), dataPassed: speaker}).status(500).end();
		}
		
		Event.findOne({_id: eventId}, function (retEventError, event) {
			if (retEventError) {
				return response.json({Error: 'Error retrieving event record.', OfficialError: error.toString()}).status(500).end();
			}
			
			event._speakers.push(speaker);
			event.save();
		});
	})
});

module.exports = router;