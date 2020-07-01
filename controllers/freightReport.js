const Freight = require("../models/Freight");
const Request = require("../models/Request");

module.exports = async function(req, res) {
    const freights = await Freight.find({});

    const requests = await Request.find({});

    res.render("freight-report", {
        requests: requests.sort(compare_shippingDate).reverse(),
        freights: freights
    });
};