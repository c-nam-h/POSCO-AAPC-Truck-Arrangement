const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define a schema for freight collection with request_id as a foreign key referencing to the request collection
const freightSchema = new mongoose.Schema({
    carrier: {
      type: String,
      default: "TBD"
    },
    freight: {
      type: Number,
      default: 0
    },
    request_id: mongoose.Schema.Types.ObjectId
  });
  
freightSchema.pre("updateOne", function() {
  const update = this.getUpdate();
  if (update.__v != null) {
    delete update.__v;
  }
  const keys = ['$set', '$setOnInsert'];
  for (const key of keys) {
    if (update[key] != null && update[key].__v != null) {
      delete update[key].__v;
      if (Object.keys(update[key]).length === 0) {
        delete update[key];
      }
    }
  }
  update.$inc = update.$inc || {};
  update.$inc.__v = 1;
})

const Freight = mongoose.model("Freight", freightSchema);



module.exports = Freight;