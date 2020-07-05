const Destination = require("../models/Destination");

module.exports = async function(req, res) {
    const newDestination = req.body;

    await Destination.create({
        customer_id: newDestination.customer,
        destination: newDestination.destination,
        streetAddress: newDestination.streetAddress,
        city: newDestination.city,
        state: newDestination.state,
        zipcode: newDestination.zipcode,
        country: newDestination.country
    });

    res.redirect("/destination");
};