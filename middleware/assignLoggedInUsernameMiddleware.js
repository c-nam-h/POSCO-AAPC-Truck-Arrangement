module.exports = function(req, res, next) {
    // assign loggedIn to req.user.username if it exists
    if (req.user) {
      currentUsername = req.user.username;
    };
    next();
};