//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/truckRequestDB", {useNewUrlParser: true, useUnifiedTopology: true});

const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const requestSchema = new mongoose.Schema({
  customer: String,
  from: String,
  to: String,
  shippingDate: String,
  deliveryDate: String,
  weightKg: Number,
  weightLb: Number,
  bolNo: String,
  truckType: String,
  specialNote: String
});


const Request = mongoose.model("Request", requestSchema);


app.get("/", function(req, res){
  Request.find({}, function(err, requests) {
    res.render("home", {
      requests: requests
    });
  });
});


app.get("/request", function(req, res){
  res.render("request");
});

//shipping vs delivery data validation
app.post("/request", function(req, res){
  const request = new Request({
    customer: req.body.postCustomer,
    from: req.body.postFrom,
    to: req.body.postTo,
    shippingDate: req.body.postShippingDate,
    deliveryDate: req.body.postDeliveryDate,
    weightKg: req.body.postWeightKg,
    weightLb: Math.round(req.body.postWeightKg * 2.204623, 0),
    bolNo: req.body.postBOLNo,
    truckType: req.body.truckOptions,
    specialNote: req.body.postSpecialNote
  });

  if (request.deliveryDate < request.shippingDate) {
    window.alert("Delivery date must be equal or later than shipping date.");
    res.redirect("/request");
  } else {
    request.save(function(err) {
      if (!err) {
          res.redirect("/");
      };
    });
  }
});


app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);

  Post.find({}, function(err, posts) {
    posts.forEach(function(post){
      const storedTitle = _.lowerCase(post.title);

      if (storedTitle === requestedTitle) {
        res.render("post", {
          title: post.title,
          content: post.content
        });
      };
    });
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
