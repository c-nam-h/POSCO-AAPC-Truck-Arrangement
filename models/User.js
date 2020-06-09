const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// define a schema for user collection
const userSchema = new mongoose.Schema({});
  
userSchema.plugin(passportLocalMongoose);
  
const User = new mongoose.model("User", userSchema);

module.exports = User;