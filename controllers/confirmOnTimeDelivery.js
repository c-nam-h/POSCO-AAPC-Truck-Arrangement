const Freight = require("../models/Freight");

module.exports = async function (req, res) {
  const freightId = req.params._id;
  await Freight.findByIdAndUpdate(freightId, { onTimeDelivery: "Y" });

  res.redirect("/freight-report");
};
