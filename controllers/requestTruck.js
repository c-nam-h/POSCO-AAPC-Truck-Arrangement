const Request = require("../models/Request");
const Freight = require("../models/Freight");
const User = require("../models/User");
const UserName = require("../models/Username"); // created this model because passport doesn't allow names to be saved in the collection
const Destination = require("../models/Destination");
const Customer = require("../models/Customer");
const Carrier = require("../models/Carrier");
const UserRole = require("../models/UserRole");

module.exports = async function (req, res) {

  const shipFromCustomer = await Customer.findOne({ _id: req.body.shipFrom });
  const shipFrom = await {
    "shipFromCustomer": shipFromCustomer.customer
  };

  const destinationFrom = await Destination.findOne({ _id: req.body.shipFromAddress });
  const shipFromAddress = await {
    "destinationID": req.body.shipFromAddress,
    "destination": destinationFrom.destination,
    "streetAddress": destinationFrom.streetAddress,
    "city": destinationFrom.city,
    "state": destinationFrom.state,
    "zipcode": destinationFrom.zipcode,
    "country": destinationFrom.country
  };


  const shipToCustomer = await Customer.findOne({ _id: req.body.shipTo });
  const shipTo = await {
    "shipToCustomer": shipToCustomer.customer
  };

  const destinationTo = await Destination.findOne({ _id: req.body.shipToAddress });
  const shipToAddress = await {
    "destinationID": req.body.shipToAddress,
    "destination": destinationTo.destination,
    "streetAddress": destinationTo.streetAddress,
    "city": destinationTo.city,
    "state": destinationTo.state,
    "zipcode": destinationTo.zipcode,
    "country": destinationTo.country
  };

  const username_id = await UserName.findOne({ user_id: req.user._id });
  const fullname = await username_id.firstName + " " + username_id.lastName;

  const request = await new Request({
    shipFrom: shipFrom["shipFromCustomer"],
    shipFromDestination: shipFromAddress["destination"],
    shipFromDestinationID: shipFromAddress["destinationID"],
    shipFromStreetAddress: shipFromAddress["streetAddress"],
    shipFromCity: shipFromAddress["city"],
    shipFromState: shipFromAddress["state"],
    shipFromZipcode: shipFromAddress["zipcode"],
    shipFromCountry: shipFromAddress["country"],
    shipTo: shipTo["shipToCustomer"],
    shipToDestination: shipToAddress["destination"],
    shipToDestinationID: shipToAddress["destinationID"],
    shipToStreetAddress: shipToAddress["streetAddress"],
    shipToCity: shipToAddress["city"],
    shipToState: shipToAddress["state"],
    shipToZipcode: shipToAddress["zipcode"],
    shipToCountry: shipToAddress["country"],
    weightKg: req.body.weightKg,
    weightLb: Math.round(req.body.weightKg * 2.204623, 0),
    bolNo: req.body.bolNo,
    comboLoad: req.body.comboLoad,
    comboBolNo: req.body.comboBolNo,
    truckType: req.body.truckOptions,
    shippingDate: req.body.shippingDate,
    deliveryDate: req.body.deliveryDate,
    specialNote: req.body.specialNote,
    requestedBy: fullname,
    user_id: req.user._id,
    username: req.user.username,
  });

  request.save(function (err, request) {
    Freight.create({
      request_id: request._id
    });
    res.redirect("/");
  });
}