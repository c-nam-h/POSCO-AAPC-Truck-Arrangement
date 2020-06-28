const admin_list = ["admin@poscoaapc.com", "jburnett@poscoaapc.com", "isabell.terry@poscoaapc.com", "dglover@poscoaapc.com"];

module.exports = function(req, res, next) {
    if (!admin_list.includes(currentUsername)) {
        return res.render("error-unauthorized");
    };
    next();
};