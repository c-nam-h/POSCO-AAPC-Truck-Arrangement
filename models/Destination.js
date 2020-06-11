const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const destinationSchema = new Schema({
    customer_id: mongoose.Schema.Types.ObjectId,
    destination: String,
    streetAddress: String,
    city: String,
    state: String,
    zipcode: Number
});

const Destination = mongoose.model("Destination", destinationSchema);

module.exports = Destination;