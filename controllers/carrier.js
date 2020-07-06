const Carrier = require("../models/Carrier");

module.exports = async function(req, res) {
    const carriers = await Carrier.find({});

    res.render("carrier", {
        carriers: carriers.sort(compare_carrierName)
    });
};