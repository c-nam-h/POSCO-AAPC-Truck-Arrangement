const Request = require("../models/Request");
const Customer = require("../models/Customer");

module.exports = async function(req, res) {
  const startShippingDate = req.body.startShippingDate;
  const endShippingDate = req.body.endShippingDate;

  let selectedShipToCustomer = req.body.shipToCustomer;
  let filteredRequests = null;
  
  // if a ship-to-customer is selected
  if (selectedShipToCustomer !== "") {
    selectedShipToCustomer = await Customer.findById(selectedShipToCustomer); // find the customer id
    filteredRequests = await Request.find({ // find all requests
      shipTo: selectedShipToCustomer.customer, // with the selected customer id
      shippingDate: {$gte: startShippingDate, $lte: endShippingDate} // within these shipping dates
    });
  } else { // if a ship-to-customer is not selected
    filteredRequests = await Request.find({ // find all requests within these shipping dates w/o customer id
      shippingDate: {$gte: startShippingDate, $lte: endShippingDate}
    });
  }
  
  // find the list of all customers and pass for other pages to use in their dropdown lists
  const customers = await Customer.find({});

  res.render("filter-requests", {
    requests: filteredRequests.sort(compare_shippingDate).reverse(),
    customers: customers.sort(compare_name),
    startShippingDate,
    endShippingDate,
    selectedShipToCustomer
  })
};