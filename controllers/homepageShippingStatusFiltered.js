const Request = require("../models/Request");
const _ = require("lodash");

module.exports = async function(req, res) {
  const filterShippingStatus = _.startCase(req.params.status);

  const allShippedRequests = await Request.find({status: filterShippingStatus});
  const userShippedRequests = await Request.find({status: filterShippingStatus, user_id: currentUserId});

  if (userRole === "admin") {
    res.render("filter", {
      requests: allShippedRequests.sort(compare_date).reverse()
    });
  } else {
    res.render("filter", {
      requests: userShippedRequests.sort(compare_date).reverse()
    });
  }
}