const Request = require("../models/Request");
const Freight = require("../models/Freight");

module.exports = async function (req, res) {
  const selectedOrderId = req.params._id;

  await Request.findByIdAndUpdate(selectedOrderId, { status: "Not Shipped" });
  await Freight.updateOne(
    { request_id: selectedOrderId },
    { onTimeDelivery: "N" }
  );

  res.redirect("/");
};
