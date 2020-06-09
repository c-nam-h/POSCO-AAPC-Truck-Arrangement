const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define a schema for request collection with user_id as a foreign key referencing to the user collection
const requestSchema = new Schema({
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
    shipped: Boolean,
    datePosted: {
      type: Date,
      default: new Date()
    },
    user_id: mongoose.Schema.Types.ObjectId
  });
  
  const Request = new mongoose.model("Request", requestSchema);

  module.exports = Request;