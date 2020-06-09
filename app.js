//jshint esversion:6
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
};

const express = require("express");
const app = express();

const session = require("express-session");

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

const bodyParser = require("body-parser");
const ejs = require("ejs");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const _ = require("lodash");

const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb+srv://" + process.env.USERNAME + ":" + process.env.PASSWORD + "@posco-aapc-logistics-l3bdr.mongodb.net/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.connect("mongodb://localhost/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});


// require each model
const Request = require("./models/Request");
const Freight = require("./models/Freight");
const User = require("./models/User");
const UserName = require("./models/UserName"); // created this model because passport doesn't allow names to be saved in the collection


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// declare this variable to refer to when the user needs to update requests
let requestedId = "";

// declare this variable to refer to a number of delete requests performed
let deletedCount = 0;


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
      // find the id of registered username and store it in UserName collection with firstname and lastname
      User.findOne({username: req.body.username}, function(err, user) {
        const user_id = user._id;
      });

      UserName.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        user_id: user._id
      })

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

// log out
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
})

// render a homepage
app.get("/", function(req, res){
  if (req.isAuthenticated()) {
    Request.find({}, function(err, requests) {
      res.render("home", {
        requests: requests,
        msg: deletedCount
      });
    });
  } else {
    res.redirect("/login");
  };
});

// render a request page
app.get("/request", function(req, res){
  if (req.isAuthenticated()) {
    res.render("request", {
      err: null,
      customer: null,
      shippingFrom: null,
      deliveryTo: null,
      shippingDate: null,
      deliveryDate: null,
      weightKg: null,
      weightLb: null,
      bolNo: null,
      truckType: null,
      specialNote: null
    });
  } else {
    res.redirect("/login");
  };
});


app.post("/request", function(req, res){

  //date validation - if delivery date is earlier than shipping date, then a user will be asked to revise those dates
  if (req.body.shippingDate > req.body.deliveryDate) {
    res.render("request", {
      err: "A delivery date cannot be earlier than shipping date!",
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
    });
  } else {

    Request.findOne({bolNo: req.body.bolNo}, function(err, request) {
      if (request) {
        res.render("request", {
          err: "The entered BOL NO " + req.body.bolNo + " already exists in the database. Please check again and enter BOL No.",
          customer: req.body.customer,
          shippingFrom: req.body.shippingFrom,
          deliveryTo: req.body.deliveryTo,
          shippingDate: req.body.shippingDate,
          deliveryDate: req.body.deliveryDate,
          weightKg: req.body.weightKg,
          weightLb: Math.round(req.body.weightKg * 2.204623, 0),
          bolNo: null,
          truckType: req.body.truckOptions,
          specialNote: req.body.specialNote,
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
          shipped: false,
          user_id: req.user._id
        });

        request.save(function(err) {
          if (!err) {
            Request.findOne({_id: ObjectID(request._id)}, function(err, request) {
              const freight = new Freight({
                carrier: "TBD",
                freight: 0,
                request_id: ObjectID(request._id)
              });
              freight.save(function(err) {
                res.redirect("/");
              });
            });
          } else {
            handleError(err);
          };
        });
      };
    });
  };
});

// delete selected row or rows in request and freight collections and redirect to the homepage
// I need to add a warning message to confirm whether the user really wants to perform delete function
app.post("/modify", function(req, res) {

    const checkboxId = req.body.checkbox;
    const clickedButton = req.body.button;

    if (clickedButton === "delete") {
      Request.deleteMany({_id: checkboxId}, function(err, deleteRequest) {
        deletedCount = deleteRequest.deletedCount;
  
        Freight.deleteMany({request_id: checkboxId}, function(err) {
          if (err) {
            return handleError(err);
          };
        });
      });
      res.redirect("/");
    } else {
      Request.updateOne({_id: checkboxId}, {shipped: "Shipped"}, function(err) {
        if (err) {
          handleError(err);
      };
    });
    res.redirect("/");
  };
});

app.post("/shipping", function(req, res) {

  const checkboxId = req.body.checkbox;
  console.log(checkboxId);
  
})

// render modify.ejs and shows a selected BOL number's information - dynamic
app.get("/modify/:_id", function(req, res) {

  requestedId = ObjectID(req.params._id);

  if (req.isAuthenticated) {
    Request.find({}, function(err, requests) {
        if (err) {
          return handleError(err);
        } else {
          requests.forEach(function(request) {

          const storedId = ObjectID(request._id);

          if (storedId.equals(requestedId)) {
            res.render("modify", {
              err: null,
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
  } else {
    res.redirect("/login");
  };
});


// update a request information with the selected ID -- still need to modify the code to validate whether a revised BOL No already exists in the database or not.
// If a revised BOL No already exists in the database, then it should give a warning message that the user cannot use the new BOL No -- WIP
app.post("/modify/:_id", function(req, res) {

  if (req.body.shippingDate > req.body.deliveryDate) {
    res.render("modify", {
      err: "A delivery date cannot be earlier than shipping date!",
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
      request_id: requestedId
    });
  } else {
    const modifiedBolNo = req.body.bolNo;

    Request.find({bolNo: modifiedBolNo}, function(err, requests) {
      let count = 0;
      let id = null;

      requests.forEach(function(request) {
        count++;
        id = request._id;
      });
      console.log(count);

      if (count === 0 || (count === 1 && requestedId.equals(id))) {
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
          };
        });
        res.redirect("/");
      } else {
        res.render("modify", {
          err: "Your BOL NO '" + modifiedBolNo + "' already exists in the database. Please check again and enter BOL No.",
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
          request_id: requestedId
        });
      };
    });
  };
});

app.get("/freight-report", function(req, res) {

  if (req.isAuthenticated()) {
    Freight.find({}, function(err, freights) {
      Request.find({}, function(err, requests) {
        if (!err) {
          res.render("freight-report", {
            requests: requests,
            freights: freights
          });
        } else {
          handleError(err);
        };
      });
    });
  } else {
    res.redirect("/login");
  };
});

app.get("/freight-detail/:_id", function(req, res) {

  requestedId = ObjectID(req.params._id);

  if (req.isAuthenticated) {
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
  } else {
    res.redirect("/login");
  };
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


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
