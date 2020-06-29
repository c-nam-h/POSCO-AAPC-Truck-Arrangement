module.exports = function(req, res, next) {
    if (userRole !== "admin") {
        return res.render("error-unauthorized");
    };
    next();
};