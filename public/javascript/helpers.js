
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




// function compare_date(a, b) {
//   if (a.shippingDate < b.shippingDate) {
//     return -1;
//   } else if (a.shippingDate > b.shippingDate) {
//     return 1;
//   } else {
//     return 0;
//   }
// };
