module.exports = function(req, res, next) {
    // assign userId if logged in
    if (req.user) {
      currentUserId = req.user._id;
      currentUsername = req.user.username;
    };
    next();
};