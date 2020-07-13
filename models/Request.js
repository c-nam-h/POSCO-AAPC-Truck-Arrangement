const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment-timezone");
const now = moment().tz("America/Chicago").format("l");

// define a schema for request collection with user_id as a foreign key referencing to the user collection
const requestSchema = new Schema({
  shipFrom: String,
  shipFromDestination: String,
  shipFromStreetAddress: String,
  shipFromCity: String,
  shipFromState: String,
  shipFromZipcode: String,
  shipFromCountry: String,
  shipTo: String,
  shipToDestination: String,
  shipToStreetAddress: String,
  shipToCity: String,
  shipToState: String,
  shipToZipcode: String,
  shipToCountry: String,
  weightKg: Number,
  weightLb: Number,
  bolNo: {
    type: String,
    default: "TBD"
  },
  comboLoad: {
    type: String,
    default: "No"
  },
  comboBolNo: {
    type: String,
    default: "N/A"
  },
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
    default: now
  },
  requestedBy: String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  username: {
    type: String,
    ref: "User"
  }
});
  
const Request = new mongoose.model("Request", requestSchema);

module.exports = Request;