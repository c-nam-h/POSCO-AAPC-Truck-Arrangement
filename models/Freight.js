const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define a schema for freight collection with request_id as a foreign key referencing to the request collection
const freightSchema = new mongoose.Schema({
    carrier: String,
    freight: Number,
    request_id: mongoose.Schema.Types.ObjectId
  });
  
const Freight = mongoose.model("Freight", freightSchema);

module.exports = Freight;