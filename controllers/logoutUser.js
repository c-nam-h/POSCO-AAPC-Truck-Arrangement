const session = require("express-session");

module.exports = function(req, res) {
    currentUserId = null;
    userRole = null;
    req.session.destroy(function() {
      res.clearCookie("connect.sid", {path: "/"});
      res.redirect("/login");
    });;
  }