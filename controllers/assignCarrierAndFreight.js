const Request = require("../models/Request");
const Freight = require("../models/Freight");
const Carrier = require("../models/Carrier");

module.exports = async function(req, res) {
    const selectedRequestId = req.params._id;

    const request = await Request.findById(selectedRequestId);
    const freight = await Freight.findOne({request_id: selectedRequestId});
    const carriers = await Carrier.find({});
        
    res.render("assign-carrier-freight", {
        _id: request._id,
        shipFrom: request.shipFrom,
        shipFromAddress: request.shipFromStreetAddress + ", " + request.shipFromCity + " " + request.shipFromState + ", " + request.shipFromZipcode + ", " + request.shipFromCountry,
        shipTo: request.shipTo,
        shipToAddress: request.shipToStreetAddress + ", " + request.shipToCity + " " + request.shipToState + ", " + request.shipToZipcode + ", " + request.shipToCountry,
        weightKg: request.weightKg,
        bolNo: request.bolNo,
        truckType: request.truckType,
        shippingDate: request.shippingDate,
        deliveryDate: request.deliveryDate,
        specialNote: request.specialNote,
        carriers: carriers,
        selectedCarrier: freight.carrier,
        freight: freight.freight,
        err: null
    });

}