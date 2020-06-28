const passport = require("passport");

module.exports = passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/'
  }), function(err, req, res, next) {
    if (err) next(err);
  };