const Request = require("../models/Request");
const Customer = require("../models/Customer");
const Destination = require("../models/Destination");

module.exports = async function(req, res, next) {
    const modifiedBolNo = req.body.bolNo;
    const requestId = req.params._id;
    
    let count = 0;
    let id = null;

    const requests = await Request.find({bolNo: modifiedBolNo});
      
    await requests.forEach(function(request) {
        count++;
        id = request._id;
    });

    const customers = await Customer.find({});
    const destinations = await Destination.find({});
    const request = await Request.findById(requestId);

    if (req.body.bolNo !== "") {
        if (!(count === 0 || (count === 1 && id.equals(requestId)))) {
            return res.render("modify", {
                customers: customers,
                destinations: destinations,
                selectedRequest: request,
                err: "Your BOL NO '" + modifiedBolNo + "' already exists in the database. Please check again and enter a different BOL No."
              });
        };
    }
    next();
};
