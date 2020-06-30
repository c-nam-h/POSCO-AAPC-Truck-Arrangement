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



// DELETE REQUEST SECTION - WHERE USERS CAN DELETE A SELECTED REQUEST AT A TIME
// delete a selected request in Request and Freight collections and redirect to the homepage
const deleteRequestController = require("./controllers/deleteRequest");
app.get("/delete-request/:_id", redirectIfNotAuthenticatedMiddleware, deleteRequestController);



// CONFIRM/CANCEL SHIPPING SECTION - WHERE ONLY ADMIN IS ALLOWED TO CHANGE SHIPPING STATUS
// confirm the shipping and change the shipping status to "Shipped"
const confirmShippingController = require("./controllers/confirmShipping");
app.get("/confirm-shipping/:_id", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], confirmShippingController);

// confirm the shipping and change the shipping status to "Not Shipped"
const cancelShippingController = require("./controllers/cancelShipping");
app.get("/cancel-shipping/:_id", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], cancelShippingController);



// MODIFY REQUEST SECTION - WHERE USERS CAN MODIFY EXISITING REQUESTS
const modifyController = require("./controllers/modify");
app.get("/modify/:_id", redirectIfNotAuthenticatedMiddleware, modifyController);

// update a request information with the selected ID -- still need to modify the code to validate whether a revised BOL No already exists in the database or not.
// If a revised BOL No already exists in the database, then it should give a warning message that the user cannot use the new BOL No -- WIP
const validateDeliveryDateInModifyMiddleware = require("./middleware/validateDeliveryDateInModifyMiddleware");
const countAndFindDuplicateBolNoMiddleware = require("./middleware/countAndFindDuplicateBolNoMiddleware");
const modifyRequestController = require("./controllers/modifyRequest");
app.post("/modify/:_id", [redirectIfNotAuthenticatedMiddleware, validateDeliveryDateInModifyMiddleware, countAndFindDuplicateBolNoMiddleware]
, modifyRequestController);



// FREIGHT REPORT SECTION - WHERE ONLY ADMIN CAN SEE CARRIER AND FREIGHT INFORMATION FOR EACH REQUEST
const freightReportController = require("./controllers/freightReport");
app.get("/freight-report", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], freightReportController);



// ASSIGN CARRIER AND FREIGHT SECTION - WHERE ONLY ADMIN CAN ASSIGN CARRIER AND FREIGHT TO REQUESTS
const assignCarrierAndFreightController = require("./controllers/assignCarrierAndFreight");
app.get("/assign-carrier-and-freight/:_id", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], assignCarrierAndFreightController);

const assignCarrierAndFreightToRequestController = require("./controllers/assignCarrierAndFreightToRequest");
app.post("/assign-carrier-and-freight/:_id", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], assignCarrierAndFreightToRequestController);


// SEARCH SECTION - WHERE USERS CAN SEARCH A REQUEST
const searchController = require("./controllers/search");
app.post("/search", redirectIfNotAuthenticatedMiddleware, searchController);



// WIP
app.get("/destination", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.redirect("/login");
  };
});



// CARRIER SECTION - WHERE ONLY ADMIN CAN SEE A LIST OF CARRIERS
const carrierController = require("./controllers/carrier");
app.get("/carrier", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], carrierController);


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


// go through all the routes and if it can't find one that matches, it will render error-404 page
app.use(function(req, res) {
  res.render("error-404");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
