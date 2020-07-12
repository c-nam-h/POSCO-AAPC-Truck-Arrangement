const Customer = require("../models/Customer");
const Request = require("../models/Request");

module.exports = async function(req, res) {

    const searchShipToCustomer = req.body.shipToCustomer;

    const filteredRequestsByShipToCustomer = Request.find({shipToCustomer: searchShipToCustomer}); 

}