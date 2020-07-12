const Request = require("../models/Request");
const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const searchedBolNo = req.body.search;
    const currentUserId = req.user._id;
  
    const request = await Request.findOne({bolNo: searchedBolNo});
    const customers = await Customer.find({});
    
    if (request) {  // if the searched BOL NO exists,
        if (userRole == "admin") {  // and if the role is admin
            res.render("searchBolNo", {  // admin can search all requests in the database
                request,
                customers
            });
        // if the role is not admin
        } else if (request.user_id.equals(currentUserId)) {  // user can only search their requests
            res.render("searchBolNo", {
              request,
              customers
            });
        // users are not allowed to see other people's requests
        } else {
            res.render("searchBolNo", {
              request: null,
              customers,
              err: "You are not authorized to see someone else's order for " + searchedBolNo + ". Please check and try again."
            });
        };
    // if the searched BOL No does not exsits,
    } else {
        res.render("searchBolNo", {  // renders an error message
            request: null,
            customers,
            err: "There is no order for " + searchedBolNo + ". Please check and try again."
        });
    }
}