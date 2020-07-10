const Request = require("../models/Request");
const UserRole = require("../models/UserRole");
const getMonday = require("../public/javascript/getMonday");
const moment = require("moment-timezone");
const now = moment().tz("America/Chicago");

module.exports = async function(req, res) {
  // declare a variable for Monday and set the hours to 0
  // this will allow the app to search for all requests regardless of hours of shipping dates
  const monday = new Date(new Date(getMonday[0], getMonday[1], getMonday[2]).setUTCHours(0, 0, 0, 0));

  console.log("monday",monday);

  // assign user role to the global variable
  const selectedUserRole = await UserRole.findOne({user_id: req.user._id});
  userRole = selectedUserRole.user_role;
  
  const allRequests = await Request.find({}); // find all requests
  const filteredRequests = []; // declare an empty array to store current week's 

  // search for requests that have shipping dates equal to or greater than this week's monday
  allRequests.forEach(function(request) {
    const shippingDate = new Date(request.shippingDate);
    if (monday <= shippingDate) {
      filteredRequests.push(request);
    }
  })

  const userRequests = await Request.find({user_id: currentUserId});

  // assign monday and sunday to the global variables later
  // to keep CST timezone and prevent UTC time from automatically changing it
  global.monday = new Date(getMonday[0], getMonday[1], getMonday[2]);
  console.log("global monday", monday);

  if (userRole === "admin") {
    res.render("homepage", {
      requests: filteredRequests.sort(compare_shippingDate).reverse()
    });
  } else {
    res.render("homepage", {
      requests: userRequests.sort(compare_shippingDate).reverse()
    });
  };  
}