const Customer = require("../models/Customer")

module.exports = async function(req, res) {
    const customers = await Customer.find({});

    res.render("customer", {
      customers: customers.sort(compare_name)
    });
  }