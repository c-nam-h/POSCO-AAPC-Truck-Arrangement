const Request = require("../models/Request");
const UserRole = require("../models/UserRole");

module.exports = async function(req, res) {
  // assign the current user's role to the global variable

  const selectedUserRole = await UserRole.findOne({user_id: req.user._id});
  userRole = selectedUserRole.user_role;
  
  const allRequests = await Request.find({});
  const userRequests = await Request.find({user_id: currentUserId});

  if (userRole === "admin") {
    res.render("homepage", {
      requests: allRequests.sort(compare_date).reverse()
    });
  } else {
    res.render("homepage", {
      requests: userRequests.sort(compare_date).reverse()
    });
  };  
}