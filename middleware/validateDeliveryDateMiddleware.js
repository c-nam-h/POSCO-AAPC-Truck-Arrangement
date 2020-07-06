const Destination = require("../models/Destination");
const Customer = require("../models/Customer");

module.exports = async function(req, res, next) {
    //date validation - if delivery date is earlier than shipping date, then a user will be asked to revise those dates
    const destinations = await Destination.find({});
    const customers = await Customer.find({});

    if (req.body.shippingDate > req.body.deliveryDate) {
        return res.render("request", {
            err: "A delivery date cannot be earlier than shipping date! Please check your delivery date and submit again.",
            shipFromId: req.body.shipFrom,
            shipFromAddressId: req.body.shipFromAddress,
            shipToId: req.body.shipTo,
            shipToAddressId: req.body.shipToAddress,
            weightKg: req.body.weightKg,
            bolNo: req.body.bolNo,
            comboLoad: req.body.comboLoad,
            comboBolNo: req.body.comboBolNo,
            truckType: req.body.truckOptions,
            shippingDate: null,
            deliveryDate: null,
            specialNote: req.body.specialNote,
            destinations: destinations,
            customers: customers
        });
    }
    next();
}

