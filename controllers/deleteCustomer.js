const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const selectedCustomerId = req.body.customer;
  
    await Customer.deleteOne({_id: selectedCustomerId}, function(err) {
        console.log(err);
    });
    res.redirect("/customer");
}