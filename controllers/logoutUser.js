const session = require("express-session");

module.exports = function(req, res) {
    currentUsername = null;
    req.session.destroy(function() {
      res.clearCookie("connect.sid", {path: "/"});
      res.redirect("/login");
    });;
  }