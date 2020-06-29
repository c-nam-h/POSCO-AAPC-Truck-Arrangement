const Request = require("../models/Request");
const UserRole = require("../models/UserRole");

module.exports = function(req, res, next) {
    // assign the current user's role to the global variable
    UserRole.findOne({user_id: req.user._id}, function(err, role) {
      userRole = role.user_role;

      if (userRole === "admin") {
        Request.find({}, function(err, requests) {
          res.render("homepage", {
            requests: requests.sort(compare_date)
          });
        });
      } else {
        Request.find({user_id: currentUserId}, function(err, requests) {
          res.render("homepage", {
            requests: requests.sort(compare_date)
          });
        });
      };
    })    
}