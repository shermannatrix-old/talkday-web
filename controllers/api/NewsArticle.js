/**
 * The NewsArticle.js controller will contain methods for creating new News Articles and also retrieving those values for listing purposes.
 * Created by		: Sherman Chen
 * Date Created		: 2016-10-28 02:54pm
 * Date Modified	: 2016-10-29 10:41pm
 */
'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../../config/config');
var NewsArticle = require('./../../models/NewsArticle');

var fs = require('fs');
var path = require('path');
var busboy = require('connect-busboy');
var htmlEncode = require('js-htmlencode');

var walk = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var pending = list.length;
		if (!pending) return done(null, results);
		list.forEach(function(file) {
			file = path.resolve(dir, file);
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
				} else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});
		});
	});
};

var imageLibraryHomeDir = ('./../../public/uploads/');

var diretoryTreeToObj = function(dir, done) {
	var results = [];

	fs.readdir(dir, function(err, list) {
		if (err)
			return done(err);

		var pending = list.length;

		if (!pending) {
			return done(null, {name: path.basename(dir), type: 'd'});
		}


		list.forEach(function(file) {
			file = path.resolve(dir, file);
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					results.push({
						type: 'd',
						name: path.basename(file),
						size: stat.size
					});

					if (!--pending)
						done(null, results);
				}
				else {
					results.push({
						type: 'f',
						name: path.basename(file),
						size: stat.size
					});
					if (!--pending)
						done(null, results);
				}
			});
		});
	});
};

router.post('/upload_image', function (request, response) {
	var fstream;
	var filePath;

	request.pipe(busboy);
	busboy.on('file', function(fieldname, file, filename) {
		filePath = path.join(__dirname, '../../public/uploads/image-library/', filename);

		console.log(filePath);

		fstream = fs.createWriteStream(filePath);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log('Photo Uploaded');
		});
	});
});

router.get('/get_thumbnail_image', function (request, response) {
	response.sendFile(path.join(__dirname, '../../public/uploads/image-library', request.query.path));
});

router.post('/get_image_library', function (request, response) {

		diretoryTreeToObj(path.join(__dirname, '../../public/uploads/image-library'), function(err, res){
			if(err)
				console.error(direrr);

			return response.json(res).status(200).end();
		});
});

/**
 * /get_all_articles - this API method will return all the News Article documents.
 * Http Method		: GET
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-29 10:40pm
 */
router.get('/get_all_articles', function (request, response) {
	NewsArticle.find({}, function (error, newsArticles) {
		return response.json(newsArticles).status(200).end();
	});
});

/**
 * /get_article_details - this API method will retrieve the details of a single News Article document.
 * Http Method		: GET
 * Date Created		: 2016-10-31 05:12pm
 */
router.get('/get_article_details', function (request, response) {
	var articleId = request.query.id;

	NewsArticle.findOne({_id: articleId}, function (error, newsArticleDetails) {
		return response.json(newsArticleDetails).status(200).end();
	});
});

/**
 * /create_new_article - this API method will add a new news article document.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-28 03:05pm
 * Date Modified	: 2016-10-31 05:07pm
 */
router.post('/create_new_article', function (request, response) {
	var modeType = request.query.mode,
		articleTitle = request.body.articleTitle;

	var newArticle = new NewsArticle({
		articleTitle	: articleTitle,
		articleSummary	: request.body.articleSummary,
		articleContent	: htmlEncode.htmlDecode(request.body.articleContent)
	});

	console.log('articleContent: ' + request.body.articleContent);

	newArticle.save(function (error) {
		if (error) {
			if (modeType != 'cms') {
				return response.json({ErrorMessage: error.toString(), ErrorStack: error.stack.toString()}).status(500).end();
			}
			else {
				response.redirect('/newsarticles/create/?error=1');
			}
		}

		if (modeType != 'cms') {
			return response.json(newArticle).status(201).end();
		}
		else {
			response.redirect('/newsarticles/create/?created=1&article=' + articleTitle);
		}
	});
});

/**
 * /update_article_details - this API method will update the details of a selected News Article document.
 * Http Method		: POST
 * Created By		: Sherman Chen
 * Date Created		: 2016-10-29 10:37pm
 */
router.post('/update_article_details', function (request, response) {
	var modeType = request.query.mode,
		articleId = request.query.id;

	NewsArticle.findOne({_id: articleId}, function (getArticleError, newsArticleDetails) {
		if (getArticleError) {
			if (modeType != 'cms') {
				return response.json({ErrorMessage: getArticleError.toString(), ErrorStack: getArticleError.stack.toString()}).status(500).end();
			}
			else {
				response.redirect('/newsarticle/edit/?id=' + articleId + '&error=1');
			}
		}

		newsArticleDetails.articleTitle = request.body.articleTitle;
		newsArticleDetails.articleSummary = request.body.articleSummary;
		newsArticleDetails.articleContent = request.body.articleContent;
		newsArticleDetails.dateModified = Date.now();

		newsArticleDetails.save();

		if (modeType != 'cms') {
			return response.json(newsArticleDetails).status(201).end();
		}
		else {
			response.redirect('/newsarticle/edit/?id=' + articleId + '&updated=1');
		}
	});


});

module.exports = router;