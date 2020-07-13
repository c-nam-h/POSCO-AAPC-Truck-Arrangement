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

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://" + process.env.USERNAME + ":" + process.env.PASSWORD + "@posco-aapc-logistics-l3bdr.mongodb.net/truckRequestDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
// mongoose.connect("mongodb://localhost/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
 
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

// declare global variables to distinguish who is logged in
global.currentUserId = null;
global.currentUsername = null;

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
const checkDuplicateRegistrationMiddleware = require("./middleware/checkDuplicateRegistrationMiddleware");

// if the logged-in user is admin, then it will register a new user
app.post("/register", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware, checkDuplicateRegistrationMiddleware], registerUserController);



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


// search through given start and end shipping dates and show requests that only fall into those dates
const filterRequestsController = require("./controllers/filterRequests");
app.post("/filter-requests", redirectIfNotAuthenticatedMiddleware, filterRequestsController);



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


// check who submitted the selected request
const checkSubmittedUserIdMiddleware = require("./middleware/checkSubmittedUserIdMiddleware");

// DELETE REQUEST SECTION - WHERE USERS CAN DELETE A SELECTED REQUEST AT A TIME
// delete a selected request in Request and Freight collections and redirect to the homepage
const deleteRequestController = require("./controllers/deleteRequest");
app.get("/delete-request/:_id", [redirectIfNotAuthenticatedMiddleware, checkSubmittedUserIdMiddleware], deleteRequestController);



// CONFIRM/CANCEL SHIPPING SECTION - WHERE ONLY ADMIN IS ALLOWED TO CHANGE SHIPPING STATUS
// confirm the shipping and change the shipping status to "Shipped"
const confirmShippingController = require("./controllers/confirmShipping");
app.get("/confirm-shipping/:_id", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], confirmShippingController);

// confirm the shipping and change the shipping status to "Not Shipped"
const cancelShippingController = require("./controllers/cancelShipping");
app.get("/cancel-shipping/:_id", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], cancelShippingController);



// MODIFY REQUEST SECTION - WHERE USERS CAN MODIFY EXISITING REQUESTS
const modifyController = require("./controllers/modify");
app.get("/modify/:_id", [redirectIfNotAuthenticatedMiddleware, checkSubmittedUserIdMiddleware], modifyController);

// update a request information with the selected ID -- still need to modify the code to validate whether a revised BOL No already exists in the database or not.
// If a revised BOL No already exists in the database, then it should give a warning message that the user cannot use the new BOL No -- WIP
const validateDeliveryDateInModifyMiddleware = require("./middleware/validateDeliveryDateInModifyMiddleware");
const countAndFindDuplicateBolNoMiddleware = require("./middleware/countAndFindDuplicateBolNoMiddleware");
const modifyRequestController = require("./controllers/modifyRequest");
app.post("/modify/:_id", [redirectIfNotAuthenticatedMiddleware, checkSubmittedUserIdMiddleware, validateDeliveryDateInModifyMiddleware, countAndFindDuplicateBolNoMiddleware]
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
const searchBolNoController = require("./controllers/searchBolNo");
app.post("/search", redirectIfNotAuthenticatedMiddleware, searchBolNoController);



// DESTINATION SECTION - WHERE USERS CAN ADD NEW DESTINATIONS OR DELETE OR UPDATE EXISTING DESTINATIONS
const destinationController = require("./controllers/destination");
app.get("/destination", redirectIfNotAuthenticatedMiddleware, destinationController);

// add a new destination
const addDestinationController = require("./controllers/addDestination");
app.get("/add-destination", redirectIfNotAuthenticatedMiddleware, addDestinationController);

const addNewDestinationController = require("./controllers/addNewDestination");
app.post("/add-destination", redirectIfNotAuthenticatedMiddleware, addNewDestinationController);

// delete a selected destination
const deleteDestinationController = require("./controllers/deleteDestination");
app.post("/delete-destination", redirectIfNotAuthenticatedMiddleware, deleteDestinationController);

// update a selected destination
const updateDestinationController = require("./controllers/updateDestination");
app.get("/update-destination/:_id", redirectIfNotAuthenticatedMiddleware, updateDestinationController);

const updateExistingDestinationController = require("./controllers/updateExistingDestination");
app.post("/update-destination/:_id", redirectIfNotAuthenticatedMiddleware, updateExistingDestinationController);




// CARRIER SECTION - WHERE ONLY ADMIN CAN SEE A LIST OF CARRIERS
const carrierController = require("./controllers/carrier");
app.get("/carrier", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], carrierController);

// Admin can access to the carrier page
const addCarrierPageController = require("./controllers/addCarrierPage");
app.get("/add-carrier", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], addCarrierPageController);

// Admin can add carriers one at a time
const addCarrierController = require("./controllers/addCarrier");
app.post("/add-carrier", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], addCarrierController);


// Admin can delete multiple selected carriers
const deleteCarrierController = require("./controllers/deleteCarrier");
app.post("/delete-carrier", [redirectIfNotAuthenticatedMiddleware, validateAdminMiddleware], deleteCarrierController);



// CUSTOMER SECTION - WHERE USERS CAN ADD/DELETE A LIST OF CUSTOMERS
const customerController = require("./controllers/customer");
app.get("/customer", redirectIfNotAuthenticatedMiddleware, customerController);

// add a new customer
const addCustomerController = require("./controllers/addCustomer");
app.get("/add-customer", redirectIfNotAuthenticatedMiddleware, addCustomerController);

const addNewCustomerController = require("./controllers/addNewCustomer");
app.post("/add-customer", redirectIfNotAuthenticatedMiddleware, addNewCustomerController);

// delete existing customers
const deleteCustomerController = require("./controllers/deleteCustomer");
app.post("/delete-customer", redirectIfNotAuthenticatedMiddleware, deleteCustomerController);



// CHANGE PASSWORD SECTION - WHERE USERS CAN CHANGE THEIR LOGIN PASSWORD
const changePasswordController = require("./controllers/changePassword");
app.get("/change-password", redirectIfNotAuthenticatedMiddleware, changePasswordController);

const compareCurrentAndNewPasswordMiddleware = require("./middleware/compareCurrentAndNewPasswordsMiddleware");
const confirmNewPasswordMiddleware = require("./middleware/confirmNewPasswordMiddleware");
const setNewPasswordController = require("./controllers/setNewPassword");
const { endsWith, filter } = require("lodash");
app.post("/change-password", [redirectIfNotAuthenticatedMiddleware, compareCurrentAndNewPasswordMiddleware, confirmNewPasswordMiddleware], setNewPasswordController);



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
