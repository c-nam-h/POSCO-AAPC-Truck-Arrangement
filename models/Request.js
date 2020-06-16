const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define a schema for request collection with user_id as a foreign key referencing to the user collection
const requestSchema = new Schema({
  shipFrom: String,
  shipFromStreetAddress: String,
  shipFromCity: String,
  shipFromState: String,
  shipFromZipcode: String,
  shipFromCountry: String,
  shipTo: String,
  shipToStreetAddress: String,
  shipToCity: String,
  shipToState: String,
  shipToZipcode: String,
  shipToCountry: String,
  weightKg: Number,
  weightLb: Number,
  bolNo: String,
  truckType: String,
  shippingDate: String,
  deliveryDate: String,
  specialNote: String,
  status: {
    type: String,
    default: "Not Shipped"
  },
  datePosted: {
    type: Date,
    default: new Date()
  },
  requestedBy: String
});
  
  const Request = new mongoose.model("Request", requestSchema);

  module.exports = Request;