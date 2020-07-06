const Destination = require("../models/Destination");
const Customer = require("../models/Customer");

module.exports = function(req, res){
    Destination.find({}, function(err, destinations) {
        Customer.find({}, function(err, customers) {
            if (!err) {
                res.render("request", {
                err: null,
                shipFromId: null,
                shipFromAddressId: null,
                shipToId: null,
                shipToAddressId: null,
                weightKg: null,
                bolNo: null,
                comboLoad: null,
                comboBolNo: null,
                truckType: null,
                shippingDate: null,
                deliveryDate: null,
                specialNote: null,
                destinations: destinations,
                customers: customers.sort(compare_name)
                });
            };
        });
    });
};