const Request = require("../models/Request");
const Customer = require("../models/Customer");
const Freight = require("../models/Freight");
const Carrier = require("../models/Carrier");

module.exports = async function(req, res) {
  const startShippingDate = req.body.startShippingDate;
  const endShippingDate = req.body.endShippingDate;

  let filteredRequests = null;
  
  const freights = await Freight.find({});
  const carriers = await Carrier.find({});

  filteredRequests = await Request.find({ // find all requests within these shipping dates w/o customer id
    shippingDate: {$gte: startShippingDate, $lte: endShippingDate}
  });

  res.render("freight-report-filter-requests", {
    requests: filteredRequests.sort(compare_shippingDate).reverse(),
    freights: freights,
    carriers: carriers.sort(compare_carrierName),
    startShippingDate,
    endShippingDate
  })  
};