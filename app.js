var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var expressValidator = require('express-validator'); // valideate using req.checkbody function use version 5.3.0
var bcrypt = require('bcryptjs'); // for encrypting password

var flash = require('connect-flash');// for flash messages like error and logged in
var mongo = require('mongodb');// for connecting database
var mongoose = require('mongoose');

var db = mongoose.connection;

var Routes = require('./routes/index');
var Users = require('./routes/users'); // users in http address for routing

var app = express();
app.use(expressValidator());  // middleware for expressvalidator
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// for file uploading use multer
var multer = require('multer');// for uploading files
var upload = multer({ dest: './uploads' });


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// middleware for the session
app.use(session({
  secret:'secret',
  saveUninitialized : true,
  resave : true
}));


// passport middleware or also called authentication system
app.use(passport.initialize());
app.use(passport.session());

//validators express use this if 5.3.0 version isn't working
/*const { check, validationResult } = require('express-validator');
router.post('/finished', function (req, res) {
let email = req.body.email

check('email', 'Email required').isEmail()

var errors = validationResult(req)
if (errors) {
  req.session.errors = errors
  req.session.success = false
  res.redirect('/email-adress')
  } else {
  req.session.success = true
  res.redirect('/finished')
  }
}); */

// connet flash messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// get request to any page we will check is local has any user object or not.
app.get('*',function(req,res,next){
  res.locals.user = req.user || null;
  next();
});

app.use('/', Routes);
app.use('/users', Users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
