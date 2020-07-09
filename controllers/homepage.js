const Request = require("../models/Request");
const UserRole = require("../models/UserRole");
const getMondaySunday = require("../public/javascript/getMondaySunday");

module.exports = async function(req, res) {
  // assign the current user's role to the global variable

  const monday = new Date(getMondaySunday[0]);
  const sunday = new Date(getMondaySunday[1]);
  
  const selectedUserRole = await UserRole.findOne({user_id: req.user._id});
  userRole = selectedUserRole.user_role;
  
  const allRequests = await Request.find({});
  const filteredRequests = [];

  allRequests.forEach(function(request) {
    const shippingDate = new Date(request.shippingDate);
    console.log(shippingDate);
    if (monday <= shippingDate && shippingDate <= sunday) {
      filteredRequests.push(request);
    }
  })
  console.log(filteredRequests);
  console.log(filteredRequests.length);
  const userRequests = await Request.find({user_id: currentUserId});

  if (userRole === "admin") {
    res.render("homepage", {
      requests: filteredRequests.sort(compare_date).reverse()
    });
  } else {
    res.render("homepage", {
      requests: userRequests.sort(compare_date).reverse()
    });
  };  
}