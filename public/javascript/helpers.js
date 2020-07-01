
module.exports = function() {
  this.compare_date = function(a, b) {
    if (a.datePosted < b.datePosted) {
      return -1;
    } else if (a.datePosted > b.datePosted) {
      return 1;
    } else {
      return 0;
    };
  };

  this.compare_shippingDate = function(a, b) {
    if (a.shippingDate < b.shippingDate) {
      return -1;
    } else if (a.shippingDate > b.shippingDate) {
      return 1;
    } else {
      return 0;
    };
  };

  this.numberWithCommas = function(n) {
    return n.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  };

  this.compare_name = function(a, b) {
    var nameA = a.customer.toUpperCase(); // ignore upper and lowercase
    var nameB = b.customer.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
  
    // if the name is the same
    return 0;
  };
};



// toggle for selecting and deselecting checkboxes in the homepage
function toggle(source) {
  checkboxes = document.getElementsByName("checkbox");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = source.checked;
  };
};


// // override the default error message and customize it for the BOL No input tag when the user does not enter data with the correct input pattern
// var bolNo = document.getElementById("bolNo");

// bolNo.oninvalid = function(event) {
//   event.target.setCustomValidity("Must contain one or two uppercase letters followed by 11 numbers. (Ex: F12345678901)");
// };

// bolNo.oninput = function(event) {
//   event.target.setCustomValidity("");
// };


// var truckType = document.getElementsByClassName("truck-type");

// for (var i = 0; i < truckType.length; i++) {
//   if (truckType[i].value === "Flatbed") {
//     truckType.checked = true;
//   }
// };





