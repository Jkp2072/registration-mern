var bcrypt = require('bcryptjs'); // for encryption
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/student');

var db =  mongoose.connection;

var UserSchema = mongoose.Schema({
    name : {
        type : String,
        index : true
      },
      email : {
        type : String
      },
      username : {
        type : String
      },
      password : {
        type : String
      },
      college : {
        type : String
      },
      branch : {
        type : String
      },
      year : {
        type : String
      },
      image : {
        type : String
      },
})
var User = module.exports = mongoose.model('User', UserSchema);

//creating methods or functions like getuserbyid, getuserbyusername for using it for login

module.exports.getUserById = function(id,callback){
  User.findById(id,callback);
}

module.exports.getUserByUsername = function(username,callback){
  var query = {username :username};
  User.findOne(query,callback);
}

module.exports.comparePassword = function(candidatePaswword,hash,callback){

  bcrypt.compare(candidatePaswword,hash,function(err,isMatch){
      callback(null,isMatch); 
  });
}


// here we export the schema for project and also save password as hashed password using bycryptjs
module.exports.createUser = function(newUser, callback) {
        bcrypt.genSalt(10,function(err,salt){
          bcrypt.hash(newUser.password,salt,function(err,hash){
            newUser.password = hash; // here input is newUser.password in hash function and output is hash.
            newUser.save(callback);
          });
        });
        
  }