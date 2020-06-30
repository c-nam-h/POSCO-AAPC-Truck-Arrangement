const Destination = require("../models/Destination");
const Customer = require("../models/Customer");
const Request = require("../models/Request");

module.exports = async function(req, res, next) {
    const requestId = req.params._id;

    //date validation - if delivery date is earlier than shipping date, then a user will be asked to revise those dates
    const destinations = await Destination.find({});
    const customers = await Customer.find({});
    const request = await Request.findById(requestId);

    if (req.body.shippingDate > req.body.deliveryDate) {
        return res.render("modify", {
            err: "A delivery date cannot be earlier than shipping date! Please check your delivery date and submit again.",
            destinations: destinations,
            selectedRequest: request,
            customers: customers
        });
    }
    next();
}

