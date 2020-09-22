const Request = require("../models/Request");

module.exports = async function (req, res) {
  const selectedOrderId = req.params._id;

  await Request.findByIdAndUpdate(selectedOrderId, { status: "Shipped" });

  //   backURL = req.headers.referer || "/";

  //   res.redirect(backURL);
  res.redirect("/");
};
