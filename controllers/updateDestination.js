const Destination = require("../models/Destination");
const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const selectedDestinationId = req.params._id;

    const destination = await Destination.findById(selectedDestinationId);
    const customer = await Customer.findById(destination.customer_id);

    res.render("update-destination", {
        err: null,
        customer,
        destination
    });
};