const passport = require("passport");
const User = require("../models/User");
const UserName = require("../models/Username");
const UserRole = require("../models/UserRole");

module.exports = function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
      // find the id of registered username and store it in UserName collection with firstname and lastname
      User.findOne({username: req.body.username}, function(err, user) {
        const user_id = user._id;
        UserName.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          user_id: user._id
        });
        UserRole.create({
          user_id: user._id
        });
      });
  
      res.render("register", {
        message: req.body.username + " is successfully registered.",
        err: null
      })
      // passport.authenticate("local")(req, res, function() {
      //   res.redirect("/");
      // });
    });
  }