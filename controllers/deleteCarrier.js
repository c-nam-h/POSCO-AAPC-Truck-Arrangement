const Carrier = require("../models/Carrier");

module.exports = async function(req, res) {
    const selectedCarrierId = req.body.checkbox;
  
    if (userRole = "admin") {
        await Carrier.deleteMany({_id: selectedCarrierId}, function(err) {
            console.log(err);
        });
        res.redirect("/carrier");
    }
}