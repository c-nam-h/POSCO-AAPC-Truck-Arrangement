const Customer = require("../models/Customer");

module.exports = async function(req, res) {
    const newCustomer = req.body.customer;

    await Customer.create({
        customer: newCustomer
    });

    res.redirect("/customer");
}