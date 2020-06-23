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

// clears out cache and prevents the user from accessing the website using the cached website
app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next()
});

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

// mongoose.connect("mongodb+srv://" + process.env.USERNAME + ":" + process.env.PASSWORD + "@posco-aapc-logistics-l3bdr.mongodb.net/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.connect("mongodb://localhost/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

// require each model
const Request = require("./models/Request");
const Freight = require("./models/Freight");
const User = require("./models/User");
const UserName = require("./models/UserName"); // created this model because passport doesn't allow names to be saved in the collection
const Destination = require("./models/Destination");
const Customer = require("./models/Customer");
const Carrier = require("./models/Carrier");

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// the email addresses in the list below will be able to see the entire website, whereas other users are limited to only certain parts of the website.
let admin_list = ["admin@poscoaapc.com", "jburnett@poscoaapc.com", "isabell.terry@poscoaapc.com", "dglover@poscoaapc.com"];

// render the register page
app.get("/register", function(req, res) {
  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;

    if (admin_list.includes(currentUsername)) {
      res.render("register");
    } else {
      res.render("error-unauthorized");
    };
  } else {
    res.redirect("/login");
  }
  
});

// post register information and redirects to the homepage when successfully registered
// I need to add a validation which loops through the user collection and sees if there is a duplicate eamil address registered already
app.post("/register", function(req, res) {

  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    
    if (admin_list.includes(currentUsername)) {
      User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
          res.render("error-user-already-registered");
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
    } else {
      res.redirect("/error-unauthorized");
    };
  } else {
    res.redirect("/login");
  };
});

// render a homepage when the user is already logged in and tries to go to the login page
app.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login");
  };
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/'
}), (err, req, res, next) => {
  if (err) next(err);
});

// log out
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
})


require("./public/javascript/helpers")();

// render a homepage with order information sorted by shipping date (oldest to newest)
app.get("/", function(req, res){
  if (req.isAuthenticated()) {
    const currentUsername = req.user.username;
    const currentUserId = req.user._id;

    if (admin_list.includes(currentUsername)) {
      Request.find({}, function(err, requests) {
        res.render("home-for-admin", {
          requests: requests.sort(compare_date)
        });
      });
    } else {
      Request.find({user_id: currentUserId}, function(err, requests) {
        res.render("home-for-regular-users", {
          requests: requests.sort(compare_date)
        });
      });
    };
  } else {
    res.redirect("/login");
  };
});



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



// render a request page
app.get("/request", function(req, res){
  if (req.isAuthenticated()) {
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
            truckType: null,
            shippingDate: null,
            deliveryDate: null,
            specialNote: null,
            destinations: destinations,
            customers: customers
          });
        };
      });
    });
  } else {
    res.redirect("/login");
  };
});




app.post("/request", function(req, res){

  if (req.isAuthenticated()) {
    //date validation - if delivery date is earlier than shipping date, then a user will be asked to revise those dates
    if (req.body.shippingDate > req.body.deliveryDate) {
      Destination.find({}, function(err, destinations) {
        Customer.find({}, function(err, customers) {
          if (!err) {
            res.render("request", {
              err: "A delivery date cannot be earlier than shipping date! Please check your delivery date and submit again.",
              shipFromId: req.body.shipFrom,
              shipFromAddressId: req.body.shipFromAddress,
              shipToId: req.body.shipTo,
              shipToAddressId: req.body.shipToAddress,
              weightKg: req.body.weightKg,
              bolNo: req.body.bolNo,
              truckType: req.body.truckOptions,
              shippingDate: null,
              deliveryDate: null,
              specialNote: req.body.specialNote,
              destinations: destinations,
              customers: customers
            });
          };
        });
      });
    } else {
      Request.findOne({bolNo: req.body.bolNo}, function(err, request) {
        if (request) {
          Destination.find({}, function(err, destinations) {
            Customer.find({}, function(err, customers) {
              if (!err) {
                res.render("request", {
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
            });
          });        
        } else {
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
  
                    const request = new Request({
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
                      requestedBy: fullname,
                      user_id: req.user._id
                    });
  
                    request.save(function(err, request) {
                      Freight.create({
                        request_id: request._id
                      });
                      res.redirect("/");
                    });
                  });              
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

  if (req.isAuthenticated) {
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
          res.render("search", {
            request
          });
        } else if (request.user_id.equals(currentUserId)) {
            res.render("search", {
              request
            });
        } else {
          res.render("search", {
            request: null,
            err: "Someone else ordered a truck for " + searchedBolNo + ". Please check and try again."
          });
        };
      } else {
        res.render("search", {
          request: null,
          err: "There is no truck order for " + searchedBolNo + ". Please check and try again."
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
