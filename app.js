var __root = __dirname;
var __config = __root + '/config/config.json';
var __src = __root + '/src';
var __views = __src + '/views';


var config = require(__config);
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')

var bodyParser = require('body-parser');
var helmet = require('helmet');
var passport = require('passport')
var mongoose = require('mongoose')
var flash = require( 'express-flash' );

var LocalStrategy = require('passport-local').Strategy;
var index = require('./routes/index');
var users = require('./routes/users');
var proposals = require('./routes/proposals');

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


var app = express();
console.log(config)
app.use(session({ secret: config.session_secret, resave: true, saveUninitialized: true }));
//

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser( config.session_secret));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use( flash() );
// send errors to page if any.
app.use(function(req, res, next){
    res.locals.error = req.flash('error');
    next();
});
// Use helmet
app.use( helmet() );

// routes
app.use('/', index);
app.use('/users', users);
app.use('/proposals', proposals);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





// mongoose
mongoose.connect('mongodb://localhost/decsys', { useMongoClient: true });


module.exports = app;
