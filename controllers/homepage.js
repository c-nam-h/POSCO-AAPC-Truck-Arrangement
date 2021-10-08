const Request = require("../models/Request");
const UserRole = require("../models/UserRole");
const Custmoer = require("../models/Customer");
const getMonday = require("../public/javascript/getMonday");
const moment = require("moment-timezone");
const Customer = require("../models/Customer");
const now = moment().tz("America/Chicago");

module.exports = async function (req, res) {
  // declare a global variable for Monday and set the hours to 0
  // this will allow the app to search for all requests regardless of hours of shipping dates
  let year = getMonday[0];
  let month = getMonday[1];
  let date = getMonday[2];

  global.monday = new Date(new Date(year, month, date).setUTCHours(0, 0, 0, 0));
  global.firstdayOfMonth = new Date(new Date(year, month, 1).setUTCHours(0, 0, 0, 0));

  // assign user role to the global variable
  const selectedUserRole = await UserRole.findOne({ user_id: req.user._id });
  userRole = selectedUserRole.user_role;

  // if month from getMonday function return single digit numbers
  if ((month + 1).toString().length === 1) {
    month += 1; // increase the value of month by 1 because 0 - 11 is the numbers used for month
    month = "0" + month; // and add a string '0' in front of the value because the shipping date has a string '0' in front of month
  } else { // if the month is two digits, then simply add 1
    month += 1;
  }

  // same goes for the date
  if (date.toString().length === 1) {
    date = "0" + date;
  }

  const dateOfMonday = year + "-" + month + "-" + date;
  console.log(dateOfMonday)

  // find all requests that are equal or greater than the date of this week's Monday for Admin
  const filteredRequests = await Request.find({ shippingDate: { $gte: dateOfMonday } });

  // find all customers and pass them to the homepage for search use
  const customers = await Customer.find({});

  res.render("homepage", {
    requests: filteredRequests.sort(compare_shippingDate).reverse(),
    customers: customers.sort(compare_name)
  });
}