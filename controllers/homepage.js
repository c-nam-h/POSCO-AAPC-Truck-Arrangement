const Request = require("../models/Request");
const UserRole = require("../models/UserRole");

module.exports = async function(req, res) {
  // assign the current user's role to the global variable
  await UserRole.findOne({user_id: req.user._id}, function(err, role) {
    userRole = role.user_role;
    console.log(userRole);

    if (userRole === "admin") {
      Request.find({}, function(err, requests) {
        res.render("homepage", {
          requests: requests.sort(compare_date).reverse()
        });
      });
    } else {
      Request.find({user_id: currentUserId}, function(err, requests) {
        res.render("homepage", {
          requests: requests.sort(compare_date).reverse()
        });
      });
    };
  })    
}