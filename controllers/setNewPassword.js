const User = require("../models/User");

module.exports = async function(req, res) {
    await User.findOne({_id: req.user._id}, function(err, user) {
        user.changePassword(req.body.currentPassword, req.body.newPassword, function(err) {
            if (err) {
                if (err.name === "IncorrectPasswordError") {
                    res.render("change-password", {
                        err: "You entered a wrong password. Please try again",
                        message: null
                    });
                } else {
                    res.render("change-password", {
                        err: "Something Went Wrong! Please Try Again.",
                        message: null
                    });
                };
            } else {
                res.render("change-password", {
                    err: null,
                    message: "Your password is changed successfully."
                });
            }
        })
    })
}
