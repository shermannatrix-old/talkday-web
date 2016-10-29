/**
 * This file is the main execution point of the entire application. Everything that this application does is initialized from here.
 * Created by	: Sherman Chen
 * Updated on	: 2016-09-22 04:43pm
 * Update Log
 * ==================================================================
 * (1) EventCategory Route Controller
 * (2) EventStatus Route Controller
 */

var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = require('./config/config');
var handlebarsIntl = require('handlebars-intl');    // Provides helpers that allow you to correctly format your content.
var helmet = require('helmet');                     // Provide a security layer for your website.
var MongoStore = require('connect-mongo')(session); // Works in conjunction with mongoose for connecting to your MongoDB database.
//var passport = require('./config/passport.js');     // For managing your user sessions
var flash = require('connect-flash');               // Useful for passing temporary data between page redirects
var mongoose = require('mongoose');                 // Extremely useful when declaring your models in ExpressJS
mongoose.Promise = require('bluebird');
var hbs = require('hbs');
var busboy = require('connect-busboy');             // We use this library when working with multi-part form postings

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/**
* Connect to MongoDB
*/
mongoose.connect(config.database);
mongoose.connection.on('error', function () {
  	console.log('MongoDB Connection Error. Please make sure that MongoDB is running');
  	process.exit(1);
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'handlebars', 'dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'js-htmlencode', 'src')));
app.use(session({
  	resave: false,
  	saveUninitialized: false,
  	secret: config.sessionSecret,
  	store: new MongoStore({mongooseConnection: mongoose.connection}),
  	cookie: {
    	// secure: true // uncomment if using HTTPS
    	httpOnly: true
  	}
}));
//app.use(passport.initialize());
//app.use(passport.session());
app.use(flash());
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('select', function(selected, options) {
  	var html = options.fn(this);
	
	if (selected) {
    	var values = selected.split(',');
    	var length = values.length;
    
    	for (var i = 0; i < length; i++) {
      		html = html.replace( new RegExp(' value=\"' + values[i] + '\"'), '$& selected="selected"');
   	 	}
  	}
  
  	return html;
});

hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

handlebarsIntl.registerWith(hbs);

app.use(function (request, response, next) {
  	response.locals.user = request.user;
  
  	next();
});

/**
 * API Controllers
 */
var userApiController = require('./controllers/api/User');
var userTypeApiController = require('./controllers/api/UserType');
var userPostApiController = require('./controllers/api/UserPost');

var eventTypeApiController = require('./controllers/api/EventType');
var eventCategoryApiController = require('./controllers/api/EventCategory');
var eventVenueApiController = require('./controllers/api/EventVenue');
var eventSpeakerApiController = require('./controllers/api/EventSpeaker');
var eventStatusApiController = require('./controllers/api/EventStatus');
var eventApiController = require('./controllers/api/Event');

var feedbackStatusApiController = require('./controllers/api/FeedbackStatus');
var feedbackApiController = require('./controllers/api/Feedback');

var rsvpStatusApiController = require('./controllers/api/RsvpStatus');
var userEventRsvpApiController = require('./controllers/api/UserEventRsvp');

var newsArticleApiController = require('./controllers/api/NewsArticle');

/**
 * API Routes
 */
app.use('/api/users', userApiController);
app.use('/api/usertypes', userTypeApiController);
app.use('/api/userposts', userPostApiController);
app.use('/api/eventtypes', eventTypeApiController);
app.use('/api/eventcategories', eventCategoryApiController);
app.use('/api/eventvenues', eventVenueApiController);
app.use('/api/eventspeakers', eventSpeakerApiController);
app.use('/api/eventstatuses', eventStatusApiController);
app.use('/api/events', eventApiController);
app.use('/api/feedbackstatuses', feedbackStatusApiController);
app.use('/api/feedbacks', feedbackApiController);
app.use('/api/rsvpstatuses', rsvpStatusApiController);
app.use('/api/usereventrsvps', userEventRsvpApiController);
app.use('/api/newsarticles', newsArticleApiController);

/**
 * Routes Controllers
 */
var userController = require('./controllers/routes/User');
var homeController = require('./controllers/routes/Home');
var eventStatusController = require('./controllers/routes/EventStatus');
var eventCategoryController = require('./controllers/routes/EventCategory');
var eventTypeController = require('./controllers/routes/EventType');
var eventVenueController = require('./controllers/routes/EventVenue');
var eventController = require('./controllers/routes/Event');
var eventSpeakerController = require('./controllers/routes/EventSpeaker');
var newsArticleController = require('./controllers/routes/NewsArticle');

app.use('/', homeController);
app.use('/users', userController);
app.use('/eventstatus', eventStatusController);
app.use('/eventcategories', eventCategoryController);
app.use('/eventtypes', eventTypeController);
app.use('/eventvenues', eventVenueController);
app.use('/events', eventController);
app.use('/eventspeakers', eventSpeakerController);
app.use('/newsarticles', newsArticleController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  	var err = new Error('Not Found');
  	err.status = 404;
  	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  	app.use(function(err, req, res, next) {
    	res.status(err.status || 500);
    	res.render('error', {
      	message: err.message,
      	error: err
    	});
  	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  	res.status(err.status || 500);
  	res.render('error', {
    	message: err.message,
    	error: {}
  	});
});


module.exports = app;
