//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;

mongoose.connect("mongodb://localhost:27017/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const requestSchema = new mongoose.Schema({
  customer: String,
  shippingFrom: String,
  deliveryTo: String,
  shippingDate: String,
  deliveryDate: String,
  weightKg: Number,
  weightLb: Number,
  bolNo: String,
  truckType: String,
  specialNote: String
});

const Request = mongoose.model("Request", requestSchema);


const freightSchema = new mongoose.Schema({
  carrier: String,
  freight: Number,
  request_id: Object
});

const Freight = mongoose.model("Freight", freightSchema);

var requstedId = "";

app.get("/", function(req, res) {
  res.render("login");
});


app.get("/list", function(req, res){
  Request.find({}, function(err, requests) {
    res.render("home", {
      requests: requests
    });
  });
});


app.get("/request", function(req, res){
  res.render("request", {
    err: null
  });
});

//date validation - if delivery date is earlier than shipping date, then a user will be asked to revise those dates
app.post("/request", function(req, res){
  const button = req.body.button;
  if (button === "Cancel") {
    res.redirect("/list");
  } else {
    if (req.body.postDeliveryDate < req.body.postShippingDate) {
      res.render("request", {
        err: "A delivery date cannot be earlier than a delivery date. Please check again."
      })
    } else {
      const request = new Request({
        customer: req.body.customer,
        shippingFrom: req.body.shippingFrom,
        deliveryTo: req.body.deliveryTo,
        shippingDate: req.body.shippingDate,
        deliveryDate: req.body.deliveryDate,
        weightKg: req.body.weightKg,
        weightLb: Math.round(req.body.weightKg * 2.204623, 0),
        bolNo: req.body.bolNo,
        truckType: req.body.truckOptions,
        specialNote: req.body.specialNote
      });
      request.save(function(err) {
        if (!err) {
            res.redirect("/list");
        };
      });
    };
  };
});

// deletes selected row or rows
// need to add a warning message to confirm whether the user really wants to perform delete function
app.post("/delete", function(req, res) {
    const checkboxId = req.body.checkbox;

    Request.deleteMany({_id: checkboxId}, function(err) {
      if (err) {
        return handleError(err);
      };
    });
    res.redirect("/list");
  });

// renders modify.ejs and shows a selected BOL number's information - dynamic
app.get("/modify/:_id", function(req, res) {

  requestedId = req.params._id;

  Request.find({}, function(err, requests) {
      if (err) {
        return handleError(err);
      } else {
        requests.forEach(function(request) {

        const storedId = request._id;

        if (storedId == requestedId) {
          res.render("modify", {
            customer: request.customer,
            shippingFrom: request.shippingFrom,
            deliveryTo: request.deliveryTo,
            shippingDate: request.shippingDate,
            deliveryDate: request.deliveryDate,
            weightKg: request.weightKg,
            weightLb: request.weightLb,
            bolNo: request.bolNo,
            truckType: request.truckType,
            specialNote: request.specialNote
          });
        };
      });
    };
  });
});

// update a request information with the selected ID -- still need to modify the code to validate whether a revised BOL No already exists in the database or not.
// If a revised BOL No already exists in the database, then it should give a warning message that the user cannot use the new BOL No -- WIP
app.post("/update", function(req, res) {

  const button = req.body.button;

  if (button === "cancel") {
    res.redirect("/list");
  } else {
    Request.updateOne({_id: ObjectID(requestedId)}, {
      customer: req.body.customer,
      from: req.body.shippingfrom,
      to: req.body.deliveryTo,
      shippingDate: req.body.shippingDate,
      deliveryDate: req.body.deliveryDate,
      weightKg: req.body.weightKg,
      weightLb: Math.round(req.body.weightKg * 2.204623, 0),
      bolNo: req.body.bolNo,
      truckType: req.body.truckOptions,
      specialNote: req.body.specialNote
    }, function(err) {
      if (err) {
        return handleError(err);
      }
    })
    console.log(requestedId);
    const freight = new Freight({
      carrier: req.body.carrier,
      freight: req.body.freight,
      request_id: ObjectID(requestedId)
    });
    freight.save(function(err) {
      if (!err) {
        res.redirect("/list");
      };
    });
  };
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
