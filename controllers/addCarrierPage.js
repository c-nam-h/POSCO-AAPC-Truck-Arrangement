module.exports = function(req, res) {
    if (userRole === "admin") {
        res.render("add-carrier");
    };
};
