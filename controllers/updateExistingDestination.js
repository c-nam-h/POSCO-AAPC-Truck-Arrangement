const Destination = require("../models/Destination");

module.exports = async function(req, res) {
    const selectedDestinationId = req.params._id;

    await Destination.findByIdAndUpdate(selectedDestinationId, {
        destination: req.body.destination,
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
        country: req.body.country
    }, function(err) {
        console.log(err);
    });

    res.redirect("/destination");
};