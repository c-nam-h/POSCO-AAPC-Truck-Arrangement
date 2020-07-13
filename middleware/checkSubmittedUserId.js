const Request = require("../models/Request");

module.exports = async function (req, res, next) {
    const selectedRequestId = req.params._id;
    const selectedRequest = await Request.findById(selectedRequestId);
    const submittedUsername = selectedRequest.username;

    if (userRole === "user") {
        if (selectedRequest.user_id.equals(currentUserId) || submittedUsername === currentUsername) {
            next();
        } else {
            return res.render("error-unauthorized");
        }
    }
} 