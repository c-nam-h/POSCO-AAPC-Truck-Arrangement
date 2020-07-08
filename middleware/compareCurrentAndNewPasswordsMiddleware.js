module.exports = function(req, res, next) {
    if (req.body.currentPassword === req.body.newPassword) {
        return res.render("change-password", {
            err: "You cannot use the current password as a new password. Please try again.",
            message: null,
        });
    };
    next();
}