module.exports = function(req, res, next) {
    if (req.body.newPassword !== req.body.confirmPassword) {
        return res.render("change-password", {
            err: "The new password doesn't match. Please try again.",
            message: null,
        });
    }
    next();
}