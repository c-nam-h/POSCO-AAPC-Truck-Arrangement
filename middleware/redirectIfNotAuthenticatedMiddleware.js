const session = require("express-session");

module.exports = function(req, res, next) {
    if (!req.isAuthenticated() || !req.session.passport) {
        return res.redirect("/login");
    };
    next();
};