const mongoose = require("mongoose");
const schema = mongoose.Schema;

const carrierSchema = new schema({
    carrierName: String
});

const Carrier = mongoose.model("Carrier", carrierSchema);

module.exports = Carrier;