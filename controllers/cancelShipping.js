const Request = require("../models/Request");

module.exports = async function(req, res) {
    const selectedOrderId = req.params._id;

    await Request.findByIdAndUpdate(selectedOrderId, {status: "Not Shipped"});

    res.redirect("/");
};