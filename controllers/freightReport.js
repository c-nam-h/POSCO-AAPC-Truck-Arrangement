const Freight = require("../models/Freight");
const Request = require("../models/Request");
const Carrier = require("../models/Carrier");

module.exports = async function(req, res) {
    const freights = await Freight.find({});

    const requests = await Request.find({});
    const carriers = await Carrier.find({});

    res.render("freight-report", {
        requests: requests.sort(compare_shippingDate).reverse(),
        freights: freights,
        carriers: carriers.sort(compare_carrierName)
    });
};