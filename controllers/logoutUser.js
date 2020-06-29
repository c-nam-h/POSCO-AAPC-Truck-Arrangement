const session = require("express-session");

module.exports = function(req, res) {
    currentUsername = null;
    userRole = null;
    req.session.destroy(function() {
      res.clearCookie("connect.sid", {path: "/"});
      console.log(userRole);
      console.log(currentUsername);
      res.redirect("/login");
    });;
  }