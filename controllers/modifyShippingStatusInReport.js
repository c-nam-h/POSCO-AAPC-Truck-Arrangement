const Request = require("../models/Request");

module.exports = async function(req, res) {
    const selectedOrderId = req.body.checkbox;
    console.log(req.headers.referer)

    if (req.body.button === "confirm") {
        await Request.updateMany({_id: selectedOrderId}, {status: "Shipped"});
    } else if (req.body.button === "cancel") {
        await Request.updateMany({_id: selectedOrderId}, {status: "Not Shipped"});
    }

    // backURL = req.headers.referer || '/freight-report';
    
    // res.redirect(backURL);
    res.redirect("/freight-report");
};
