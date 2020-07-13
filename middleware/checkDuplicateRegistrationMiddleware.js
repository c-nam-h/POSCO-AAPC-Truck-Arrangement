const User = require("../models/User");

module.exports = function(req, res, next) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register", {
                err: req.body.username + " is already registered. Please try again.",
                message: null
            })
        }
        next();
    });
};