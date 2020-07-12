const Request = require("../models/Request");

module.exports = async function(req, res) {
    const startShippingDate = req.body.startShippingDate;
    const endShippingDate = req.body.endShippingDate;
  
    const filteredRequests = await Request.find({shippingDate: {$gte: startShippingDate, $lte: endShippingDate}});
  
    res.render("search-shipping-date", {
      requests: filteredRequests.sort(compare_shippingDate).reverse(),
      startShippingDate,
      endShippingDate
    })
};