const Request = require("../models/Request");
const getMonday = require("../public/javascript/getMonday");
const moment = require("moment-timezone");

module.exports = async function (req, res) {
    const user_id = req.user._id;
    let year = getMonday[0];
    let month = getMonday[1];

    // if month from getMonday function return single digit numbers
    if (month.toString().length === 1) {
        month += 1; // increase the value of month by 1 because 0 - 11 is the numbers used for month
        month = "0" + month; // and add a string '0' in front of the value
    } // because the shipping date has a string '0' in front of month

    const firstdateOfMonth = year + "-" + month + "-01";

    // find all requests that are equal or greater than the first date of month for the logged-in user
    const requests = await Request.find({ shippingDate: { $gte: firstdateOfMonth }, user_id: user_id });

    console.log(requests)

    res.render("my-load", {
        requests
    })
};