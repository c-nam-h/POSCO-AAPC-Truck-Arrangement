const Freight = require("../models/Freight");
const Request = require("../models/Request");
const Carrier = require("../models/Carrier");
const getMonday = require("../public/javascript/getMonday");
const moment = require("moment-timezone");

module.exports = async function(req, res) {
    const freights = await Freight.find({});

    const requests = await Request.find({});
    const carriers = await Carrier.find({});

    let year = getMonday[0];
    let month = getMonday[1];

    // if month from getMonday function return single digit numbers
    if (month.toString().length === 1) {
        month += 1; // increase the value of month by 1 because 0 - 11 is the numbers used for month
        month = "0" + month; // and add a string '0' in front of the value
    } // because the shipping date has a string '0' in front of month

    const firstdateOfMonth = year + "-" + month + "-01";

    // find all requests that are equal or greater than the first date of month for Admin
    const filteredRequests = await Request.find({shippingDate: {$gte: firstdateOfMonth}}); 

    res.render("freight-report", {
        requests: filteredRequests.sort(compare_shippingDate).reverse(),
        freights: freights,
        carriers: carriers.sort(compare_carrierName)
    });
};