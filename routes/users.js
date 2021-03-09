var express = require('express');
var router = express.Router();
var multer = require('multer'); // file upload and storage
var upload = multer({ dest: './uploads' });
var passport = require('passport'); // for login passport authenticat
var LocalStrategy = require('passport-local');


var User = require('../models/user'); // database calling

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// get for signup
router.get('/signup', function(req, res, next) {
  res.render('signup',{title : 'Sign up'});
});
//get for login
router.get('/login', function(req, res, next) {
  res.render('login',{title : 'Login'});
});
//post login
router.post('/login',
 passport.authenticate('local',{failureRedirect : '/users/login', failureFlash: 'Invalid user, please register first'}) ,
  function(req,res){
    req.flash('success','Logged in ');
    res.redirect('/');// local is there so it will authenticate as per described in LocalStrategy
  
});


passport.serializeUser(function(user, done) {
  done(null, user.id);
});



passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy(function(username,password,done){
// done is a callback, 
User.getUserByUsername(username,function(err,user){
  if(err) throw err;//seeing if user is there or not
  if(!user){
    return done(null, false,{message :'Unknown'});
  }
  User.comparePassword(password,user.password,function(err, isMatch){
    if(err) return done(err);
    if(isMatch){
      return done(null,user);
    }else{
      return done(null,false,{message : 'Invalid password'});// checking password from database and login page
    }
  });
});
}));

// post for signup, upload.single('image) uses to upload image with help of multer
router.post('/signup',upload.single('image'), function(req, res, next) {
  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var college = req.body.college;
  var year = req.body.year;
  var branch = req.body.branch;
// for uploading file
  if(req.file){
    console.log('uploading file.....');
    var img = req.file.filename;
  }
  else{
    console.log('no file.....');
    var img = 'empty.jpg';
  }

  // validate forms
  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','email is invalid').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','passwords do not match').equals(req.body.password);
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('college','College is required').notEmpty();
 

  // error handling
  var err = req.validationErrors();
  if(err){
    res.render('signup',{
      errors : err
    });
  }
  else{//adding newuser to database as no errors in validation
    var newUser= new User({
      name : name,
      email : email,
      username : username,
      password : password,
      college : college,
      branch : branch,
      year:year,
      image : img
    });// creating object or entry for our schema or model named User
    User.createUser(newUser,function(err,user){
      if(err) throw err;
      console.log(user);
    })
    req.flash('success','Registered in, you can easily log in.');
      //flash message for register
    res.location('/');
    res.redirect('/');
    // redirect to the home page
  }

});

router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','logged out');
  res.redirect('/users/login');
});

module.exports = router;
