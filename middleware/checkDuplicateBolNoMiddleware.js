const Request = require("../models/Request");
const Destination = require("../models/Destination");
const Customer = require("../models/Customer");

module.exports = async function(req, res, next) {
    // if the entered BOL No already exists in the database, return an error message.
    const destinations = await Destination.find({});
    const customers = await Customer.find({});
    const request = await Request.findOne({bolNo: req.body.bolNo});

    if (request) {
        return res.render("request", {
            err: "There is already an order for your BOL NO, " + req.body.bolNo + ". Please check again.",
            shipFromId: req.body.shipFrom,
            shipFromAddressId: req.body.shipFromAddress,
            shipToId: req.body.shipTo,
            shipToAddressId: req.body.shipToAddress,
            weightKg: req.body.weightKg,
            bolNo: null,
            truckType: req.body.truckOptions,
            shippingDate: req.body.shippingDate,
            deliveryDate: req.body.deliveryDate,
            specialNote: req.body.specialNote,
            destinations: destinations,
            customers: customers
        });
    };
    next();
}
