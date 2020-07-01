const Carrier = require("../models/Carrier");

module.exports = async function(req, res) {
    const newCarrier = req.body.carrierName;

    if (userRole === "admin") {
        await Carrier.create({
            carrierName: newCarrier
        });
        res.redirect("/carrier");
    };
};