const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userNameSchema = new Schema({
    firstName: String,
    lastName: String,
    user_id: mongoose.Schema.Types.ObjectId
});

const UserName = mongoose.model("UserName", userNameSchema);

module.exports = UserName;