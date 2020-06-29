const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userRoleSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    user_role: {
        type: String,
        default: "user", // There are 2 roles: user and admin
        required: true
    }
});

const UserRole = mongoose.model("UserRole", userRoleSchema);

module.exports = UserRole;