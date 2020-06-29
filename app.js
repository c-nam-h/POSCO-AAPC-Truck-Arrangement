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


const deleteCacheMiddleware = require("./middleware/deleteCacheMiddleware");
app.use(deleteCacheMiddleware);


app.set("etag", false);
app.disable("view cache");

const bodyParser = require("body-parser");
const ejs = require("ejs");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const _ = require("lodash");

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false); // opt in to using the MongoDB driver's findOneAndUpdate() function
const ObjectID = require("mongodb").ObjectID;

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

// require each model
const Request = require("./models/Request");
const Freight = require("./models/Freight");
const User = require("./models/User");
const UserName = require("./models/Username"); // created this model because passport doesn't allow names to be saved in the collection
const Destination = require("./models/Destination");
const Customer = require("./models/Customer");
const Carrier = require("./models/Carrier");
const UserRole = require("./models/UserRole");

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// the email addresses in the list below will be able to see the entire website, whereas other users are limited to only certain parts of the website.
let admin_list = ["admin@poscoaapc.com", "jburnett@poscoaapc.com", "isabell.terry@poscoaapc.com", "dglover@poscoaapc.com"];



// declare a global variable to distinguish which userId is logged in
global.currentUserId = null;

const assignLoggedInUserIdMiddleware = require("./middleware/assignLoggedInUserIdMiddleware");
app.use("*", assignLoggedInUserIdMiddleware); // specify with the wildcard that on all requests, this middleware should be executed

// declare a global variable to distinguish what user-role the logged-in user has
global.userRole = null;



// import the middleware to redirect to the login page if the user is not authenticated or logged in
const redirectIfNotAuthenticatedMiddleware = require("./middleware/redirectIfNotAuthenticatedMiddleware");



// REGISTRATION SECTION
const validateAdminMiddleware = require("./middleware/validateAdminMiddleware");
const registerController = require("./controllers/register");

// if the current user is administrator, render the register page. If not, redner the error page
app.get("/register", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], registerController);

const registerUserController = require("./controllers/registerUser");
const validateRegistrationMiddleware = require("./middleware/validateRegistrationMiddleware");

// if the logged-in user is admin, then it will register a new user
app.post("/register", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware, validateRegistrationMiddleware], registerUserController);



// import a middleware to redirect to the homepage if authenticated
const redirectIfAuthenticatedMiddleware = require("./middleware/redirectIfAuthenticatedMiddleware");



// LOGIN SECTION
// render a homepage when the user is already logged in and tries to go to the login page
const loginController = require("./controllers/login");
app.get("/login", redirectIfAuthenticatedMiddleware, loginController);

// import the loginUser controller to authenticate and login the user
const loginUserController = require("./controllers/loginUser");
app.post('/login', redirectIfAuthenticatedMiddleware, loginUserController);



// LOGOUT SECTION
// import the logout controller to destroy session and logout the user
const logoutUserController = require("./controllers/logoutUser");
app.get("/logout", logoutUserController);



// import JS functions to use them in the server side
require("./public/javascript/helpers")();


// HOMEPAGE SECTION - WHERE USERS CAN SEE THEIR REQUESTS
const homepageController = require("./controllers/homepage");

// render a homepage with order information sorted by shipping date (oldest to newest)
app.get("/", redirectIfNotAuthenticatedMiddleware, homepageController);



// app.get("/register-destination", function(req, res) {
//   if (req.isAuthenticated()) {
//     res.render("destination");
//   } else {
//     res.redirect("/login");
//   }
// });



// app.post("/register-destination", function(req, res) {
//   Customer.findOne({customer: req.body.customer}, "_id", function(err, customer) {
//     Destination.create({
//       customer_id: customer,
//       destination: req.body.destination,
//       streetAddress: req.body.streetAddress,
//       city: req.body.city,
//       state: req.body.state,
//       zipcode: req.body.zipcode,
//       country: req.body.country
//     });
//   });
  
//   res.redirect("/");
// });


// REQUEST SECTION - WHERE USERS MAKE REQUESTS FOR TRUCKS
const requestController = require("./controllers/request");
// render a request page if the user is logged in
app.get("/request", redirectIfNotAuthenticatedMiddleware, requestController);

// import the middleware to validate that delivery date is equal to or later than shipping date
const validateDeliveryDateMiddleware = require("./middleware/validateDeliveryDateMiddleware");
// import the middleware to check if there is a duplicate BOL No already registered in the db
const checkDuplicateBolNoMiddleware = require("./middleware/checkDuplicateBolNoMiddleware");
const requestTruckController = require("./controllers/requestTruck");
app.post("/request", [redirectIfNotAuthenticatedMiddleware, validateDeliveryDateMiddleware, checkDuplicateBolNoMiddleware]
, requestTruckController);






// delete selected row or rows in request and freight collections and redirect to the homepage
// I need to add a warning message to confirm whether the user really wants to perform delete function
app.get("/delete-order/:_id", function(req, res) {
  const selectedOrderId = req.params._id;

  if (req.isAuthenticated()) {
    Request.findByIdAndDelete(selectedOrderId, function(err) {
      if (err) {
        res.render("error-404");
      }
    });
  
    Freight.deleteOne({request_id: selectedOrderId}, function(err) {
      if (err) {
        res.render("error-404");
      }
    });

    res.redirect("/");
  } else {
    res.redirect("/login");
  };
});



// confirm the shipping and change the shipping status to "Shipped"
app.get("/confirm-shipping/:_id", function(req, res) {

  if (req.isAuthenticated()) {
    const selectedOrderId = req.params._id;
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Request.findByIdAndUpdate(selectedOrderId, {status: "Shipped"}, function(err, request) {
        if (err) {
          res.render("error-404");
        }
      });
      res.redirect("/");
    } else {
      res.render("error-unauthorized");
    }
  } else {
    res.redirect("/login");
  };  
})

// confirm the shipping and change the shipping status to "Not Shipped"
app.get("/cancel-shipping/:_id", function(req, res) {
  
  if (req.isAuthenticated()) {
    const selectedOrderId = req.params._id;
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Request.findByIdAndUpdate(selectedOrderId, {status: "Not Shipped"}, function(err, request) {
        if (err) {
          res.render("error-404");
        };
      });
      res.redirect("/");
    } else {
      res.render("error-unauthorized");
    }
  } else {
    res.redirect("/login");
  };  
})


// render modify.ejs and shows a selected BOL number's information - dynamic
app.get("/modify/:_id", function(req, res) {
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  const orderId = ObjectID(req.params._id);

  if (req.isAuthenticated && req.session.passport) {
    Customer.find({}, function(err, customers) {
      Destination.find({}, function(err, destinations) {
        Request.findById(orderId, function(err, request) {
          res.render("modify", {
            customers: customers,
            destinations: destinations,
            selectedRequest: request,
            err: null
          });
        });
      });
    });
  } else {
    res.redirect("/login");
  };
});


// update a request information with the selected ID -- still need to modify the code to validate whether a revised BOL No already exists in the database or not.
// If a revised BOL No already exists in the database, then it should give a warning message that the user cannot use the new BOL No -- WIP
app.post("/modify/:_id", function(req, res) {
  const orderId = req.params._id;

  if (req.isAuthenticated()) {
    if (req.body.shippingDate > req.body.deliveryDate) {
      Customer.find({}, function(err, customers) {
        Destination.find({}, function(err, destinations) {
          Request.findById(orderId, function(err, request) {
            res.render("modify", {
              customers: customers,
              destinations: destinations,
              selectedRequest: request,
              err: "A delivery date cannot be earlier than shipping date!"
            });
          });
        });
      });
    } else {
      const modifiedBolNo = req.body.bolNo;
  
      Request.find({bolNo: modifiedBolNo}, function(err, requests) {
        let count = 0;
        let id = "";
  
        requests.forEach(function(request) {
          count++;
          id = ObjectID(request._id);
        });
  
        if (count === 0 || (count === 1 && id.equals(orderId))) {
          let shipFrom = {
            shipFromCustomer: ""
          };
  
          let shipFromAddress = {
            destination: "",
            streetAddress: "",
            city: "",
            state: "",
            zipcode: "",
            country: ""
          }
  
          let shipTo = {
            shipToCustomer: ""
          };
  
          let shipToAddress = {
            destination: "",
            streetAddress: "",
            city: "",
            state: "",
            zipcode: "",
            country: ""
          }
  
  
          Customer.findOne({_id: ObjectID(req.body.shipFrom)}, function(err, customer) {
            shipFrom["shipFromCustomer"] = customer.customer;
            Destination.findOne({_id: ObjectID(req.body.shipFromAddress)}, function(err, destination) {
              shipFromAddress["destination"] = destination.destination;
              shipFromAddress["streetAddress"] = destination.streetAddress;
              shipFromAddress["city"] = destination.city;
              shipFromAddress["state"] = destination.state;
              shipFromAddress["zipcode"] = destination.zipcode;
              shipFromAddress["country"] = destination.country;
              Customer.findOne({_id: ObjectID(req.body.shipTo)}, function(err, customer) {
                shipTo["shipToCustomer"] = customer.customer;
                Destination.findOne({_id: ObjectID(req.body.shipToAddress)}, function(err, destination) {
                  shipToAddress["destination"] = destination.destination;
                  shipToAddress["streetAddress"] = destination.streetAddress;
                  shipToAddress["city"] = destination.city;
                  shipToAddress["state"] = destination.state;
                  shipToAddress["zipcode"] = destination.zipcode;
                  shipToAddress["country"] = destination.country;
                  UserName.findOne({user_id: ObjectID(req.user._id)}, function(err, userName) {
                    const fullname = userName.firstName + " " + userName.lastName;
  
                    Request.findByIdAndUpdate(orderId, {
                      shipFrom: shipFrom["shipFromCustomer"],
                      shipFromDestination: shipFromAddress["destination"],
                      shipFromStreetAddress: shipFromAddress["streetAddress"],
                      shipFromCity: shipFromAddress["city"],
                      shipFromState: shipFromAddress["state"],
                      shipFromZipcode: shipFromAddress["zipcode"],
                      shipFromCountry: shipFromAddress["country"],
                      shipTo: shipTo["shipToCustomer"],
                      shipToDestination: shipToAddress["destination"],
                      shipToStreetAddress: shipToAddress["streetAddress"],
                      shipToCity: shipToAddress["city"],
                      shipToState: shipToAddress["state"],
                      shipToZipcode: shipToAddress["zipcode"],
                      shipToCountry: shipToAddress["country"],
                      weightKg: req.body.weightKg,
                      weightLb: Math.round(req.body.weightKg * 2.204623, 0),
                      bolNo: req.body.bolNo,
                      truckType: req.body.truckOptions,
                      shippingDate: req.body.shippingDate,
                      deliveryDate: req.body.deliveryDate,
                      specialNote: req.body.specialNote,
                      requestedBy: fullname
                    }, function(err, request) {
                      console.log(err);
                    });
                    res.redirect("/");
                  });              
                });
              });
            });
          });
        } else {
          Customer.find({}, function(err, customers) {
            Destination.find({}, function(err, destinations) {
              Request.findById(orderId, function(err, request) {
                res.render("modify", {
                  customers: customers,
                  destinations: destinations,
                  selectedRequest: request,
                  err: "Your BOL NO '" + modifiedBolNo + "' already exists in the database. Please check again and enter BOL No."
                });
              });
            });
          });
        };
      });
    };
  } else {
    res.redirect("/login");
  };  
});


app.get("/freight-report", function(req, res) {

  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
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
      res.redirect("/");  
    };
  } else {
    res.redirect("/login");
  };
});


app.get("/assign-carrier-and-freight/:_id", function(req, res) {

  if (req.isAuthenticated) {
    const selectedOrderId = req.params._id;
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Request.findById(selectedOrderId, function(err, request) {
        Freight.findOne({request_id: selectedOrderId}, function(err, freight) {
          Carrier.find({}, function(err, carriers) {
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
          });
        });
      });
    } else {
      res.render("error-unauthorized");
    };
  } else {
    res.redirect("/login");
  };
});

app.post("/assign-carrier-and-freight/:_id", function(req, res) {

  if (req.isAuthenticated()) {
    const selectedOrderId = req.params._id;
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Freight.updateOne({request_id: selectedOrderId}, {
        carrier: req.body.carrier,
        freight: req.body.freight
      }, function(err) {
        if (err) {
          res.render("error-404");
        };
      });
      res.redirect("/");
    } else {
      res.render("error-unauthorized");
    };    
  } else {
    res.redirect("/login");
  };
});


app.post("/search", function(req, res) {
  if (req.isAuthenticated()) {
    const searchedBolNo = req.body.search;
    const currentUsername = req.user.username;
    const currentUserId = req.user._id;
  
    Request.findOne({bolNo: searchedBolNo}, function(err, request) {
      if (request) {
        if (admin_list.includes(currentUsername)) {
          res.render("search-for-admin", {
            request
          });
        } else if (request.user_id.equals(currentUserId)) {
            res.render("search-for-regular-users", {
              request
            });
        } else {
          res.render("search-for-regular-users", {
            request: null,
            err: "You are not authorized to see someone else's order for " + searchedBolNo + ". Please check and try again."
          });
        };
      } else {
        res.render("search-for-regular-users", {
          request: null,
          err: "There is no order for " + searchedBolNo + ". Please check and try again."
        });
      };
    });
  } else {
    res.redirect("/login");
  }
});


app.get("/destination", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  };
});


app.get("/carrier", function(req, res) {
  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Carrier.find({}, function(err, carriers) {
        res.render("carrier", {
          carriers
        });
      });
    } else {
      res.redirect("/");
    };
  } else {
    res.redirect("/login");
  };
});

app.post("/delete-carrier", function(req, res) {
  const selectedCarrierId = req.body.checkbox;

  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Carrier.deleteMany({_id: selectedCarrierId}, function(err) {
        console.log(err);
      });
      res.redirect("/carrier");
    } else {
      res.render("error-unauthorized");
    };
  } else {
    res.redirect("/login");
  };  
});


app.get("/add-carrier", function(req, res) {
  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      res.render("add-carrier");
    } else {
      res.redirect("/");
    };
  } else {
    res.redirect("/login");
  };
});

app.post("/add-carrier", function(req, res) {
  const newCarrier = req.body.carrierName;
  
  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    if (admin_list.includes(currentUsername)) {
      Carrier.create({
        carrierName: newCarrier
      });
      res.redirect("/carrier");
    } else {
      res.render("error-unauthorized");
    };
  } else {
    res.redirect("/login");
  };
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
