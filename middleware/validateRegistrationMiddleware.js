const User = require("../models/User");

module.exports = function(req, res, next) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.render("error-user-already-registered");
        }
        next();
    });
};