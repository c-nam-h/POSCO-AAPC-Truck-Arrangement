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


// define a schema for user collection
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// define a schema for request collection with user_id as a foreign key referencing to the user collection
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
  specialNote: String,
  user_id: mongoose.Schema.Types.ObjectId
});

const Request = new mongoose.model("Request", requestSchema);


// define a schema for freight collection with request_id as a foreign key referencing to the request collection
const freightSchema = new mongoose.Schema({
  carrier: String,
  freight: Number,
  request_id: mongoose.Schema.Types.ObjectId
});

const Freight = mongoose.model("Freight", freightSchema);

// declare this variable to refer to when the user needs to update requests
let requestedId = "";

// render the register page
app.get("/register", function(req, res) {
  res.render("register");
});

// post register information and redirects to the homepage when successfully registered
// I need to add a validation which loops through the user collection and sees if there is a duplicate eamil address registered already
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
    if (req.body.deliveryDate < req.body.shippingDate) {
      res.render("request", {
        err: "A delivery date cannot be earlier than a delivery date. Please check again."
      });
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
        specialNote: req.body.specialNote,
        user_id: req.user._id
      });


      request.save(function(err) {
        if (!err) {
          Request.findOne({bolNo: req.body.bolNo}, function(err, request) {
            const freight = new Freight({
              carrier: "TBD",
              freight: 0,
              request_id: ObjectID(request._id)
            });
            freight.save(function(err) {
              res.redirect("/");
            });
          });
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

  requestedId = ObjectID(req.params._id);

  Request.find({}, function(err, requests) {
      if (err) {
        return handleError(err);
      } else {
        requests.forEach(function(request) {

        const storedId = ObjectID(request._id);

        if (storedId.equals(requestedId)) {
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
            specialNote: request.specialNote,
            request_id: requestedId
          });
        };
      });
    };
  });
});

// update a request information with the selected ID -- still need to modify the code to validate whether a revised BOL No already exists in the database or not.
// If a revised BOL No already exists in the database, then it should give a warning message that the user cannot use the new BOL No -- WIP
app.post("/modify/:id", function(req, res) {

  const button = req.body.button;

  if (button === "cancel") {
    res.redirect("/");
  } else {
    Request.updateOne({_id: requestedId}, {
      customer: req.body.customer,
      from: req.body.shippingfrom,
      to: req.body.deliveryTo,
      shippingDate: req.body.shippingDate,
      deliveryDate: req.body.deliveryDate,
      weightKg: req.body.weightKg,
      weightLb: Math.round(req.body.weightKg * 2.204623, 0),
      bolNo: req.body.bolNo,
      truckType: req.body.truckOptions,
      specialNote: req.body.specialNote,
      user_id: req.user._id
    }, function(err) {
      if (err) {
        return handleError(err);
      }
    });


    res.redirect("/");
  };
});

app.get("/freight-report", function(req, res) {
  const idList = [];

  if (req.isAuthenticated()) {
    Freight.find({}, function(err, freights) {
      if (err) {
        handleError(err);
      } else {
        freights.forEach(function(freight) {
          idList.push(freight.request_id);
        });

        Request.find({}, function(err, requests) {
          if (err) {
            handleError(err);
          } else{
            res.render("freight-report", {
              requests: requests,
              freights: freights,
              id: idList
            });
          };
        });
      };
    });
  };
});

app.get("/freight-detail/:_id", function(req, res) {

  requestedId = ObjectID(req.params._id);

  Request.findOne({_id: requestedId}, function(err, request) {
    Freight.findOne({request_id: requestedId}, function(err, freight) {
      res.render("freight-detail", {
        request_id: request._id,
        customer: request.customer,
        shippingFrom: request.shippingFrom,
        deliveryTo: request.deliveryTo,
        shippingDate: request.shippingDate,
        deliveryDate: request.deliveryDate,
        weightKg: request.weightKg,
        weightLb: request.weightLb,
        bolNo: request.bolNo,
        truckType: request.truckType,
        specialNote: request.specialNote,
        frieght_id: freight._id,
        freight: freight.freight,
        carrier: freight.carrier
      });
    });
  });
});

app.post("/freight-detail/:_id", function(req, res) {

  Freight.updateOne({request_id: requestedId}, {
    carrier: req.body.carrier,
    freight: req.body.freight
  }, function(err) {
    if (err) {
      handleError(err);
    };
  });
  res.redirect("/freight-report");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
