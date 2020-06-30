const Customer = require("../models/Customer");
const Destination = require("../models/Destination");
const Request = require("../models/Request");

 module.exports = async function(req, res) {
    const requestId = req.params._id;

    const customers = await Customer.find({});
    const destinations = await Destination.find({});
    const request = await Request.findById(requestId);

    res.render("modify", {
        customers: customers.sort(compare_name),
        destinations: destinations,
        selectedRequest: request,
        err: null
    });
};