const Request = require("../models/Request");
const Freight = require("../models/Freight");

module.exports = async function(req, res) {
    const selectedOrderId = req.params._id;

    await Request.findByIdAndDelete(selectedOrderId);
  
    await Freight.deleteOne({request_id: selectedOrderId});
  
    res.redirect("/");
  
  }