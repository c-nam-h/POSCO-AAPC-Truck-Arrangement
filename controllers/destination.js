const Destination = require("../models/Destination");
const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const destinations = await Destination.find({});
    const customers = await Customer.find({});

    res.render("destination", {
        destinations,
        customers: customers.sort(compare_name)
        }
    );
}
