//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

const Request = new mongoose.model("Request", requestSchema);

const freightSchema = new mongoose.Schema({
  carrier: String,
  freight: Number,
  request_id: Object
});

const Freight = mongoose.model("Freight", freightSchema);

let requstedId = "";

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      handleError(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    };
  });
});

// render a homepage when the user is already logged in and tries to go to the login page
app.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login");
  };
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  console.log(user);

  req.login(user, function(err) {
    if (err) {
      handleError(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    };
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
})

app.get("/", function(req, res){
  if (req.isAuthenticated()) {
    Request.find({}, function(err, requests) {
      res.render("home", {
        requests: requests
      });
    });
  } else {
    res.redirect("/login");
  };
});


app.get("/request", function(req, res){
  if (req.isAuthenticated()) {
    res.render("request", {
      err: null
    });
  } else {
    res.redirect("/login");
  };
});

//date validation - if delivery date is earlier than shipping date, then a user will be asked to revise those dates
app.post("/request", function(req, res){
  const button = req.body.button;
  if (button === "Cancel") {
    res.redirect("/");
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
            res.redirect("/");
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
    res.redirect("/");
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
    res.redirect("/");
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
        res.redirect("/");
      };
    });
  };
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
