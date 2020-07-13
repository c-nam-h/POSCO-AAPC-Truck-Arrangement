const Request = require("../models/Request");
const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const searchedBolNo = req.body.search;
    const currentUserId = req.user._id;
  
    const request = await Request.findOne({bolNo: searchedBolNo});
    const customers = await Customer.find({});
    
    if (request) {  // if the searched BOL NO exists,
        res.render("searchBolNo", {  // search all requests in the database
            request,
            customers
        });
    } else {
        res.render("searchBolNo", {  // renders an error message
            request: null,
            customers,
            err: "There is no order for " + searchedBolNo + ". Please check and try again."
        });
    }
}