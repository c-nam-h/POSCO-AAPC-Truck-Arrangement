const Destination = require("../models/Destination");
const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const selectedDestinationId = req.body.destination;

    await Destination.findByIdAndDelete(selectedDestinationId);
    res.redirect("/destination");
};
