const Freight = require("../models/Freight");


module.exports = async function(req, res) {
    const selectedRequestId = req.params._id;

    await Freight.updateOne({request_id: selectedRequestId}, {
        carrier: req.body.carrier,
        freight: req.body.freight
        }, function(err) {
            console.log(err);
        });
    res.redirect("/");
};