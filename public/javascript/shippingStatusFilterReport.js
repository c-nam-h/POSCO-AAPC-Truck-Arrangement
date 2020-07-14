shippingStatusFilter("all");

function shippingStatusFilter(status) {
    let requests = document.getElementsByClassName("tr");
    
    if (status === "all") {
        status = "";
    }

    for (var i = 0; i < requests.length; i++) {
        removeClass(requests[i], "show-tr");
        if (requests[i].className.indexOf(status) > -1) {
            addClass(requests[i], "show-tr");
        }
    }
}

function addClass(element, name) {
    let arr1 = element.className.split(" ");
    let arr2 = name.split(" ");

    for (var i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) === -1) {
            element.className += " " + arr2[i];
        }
    }
}

function removeClass(element, name) {
    let arr1 = element.className.split(" ");
    let arr2 = name.split(" ");

    for (var i = 0; i < arr1.length; i++) {
        while (arr1.indexOf(arr2[i]) > -1) {
            arr1.splice(arr1.indexOf(arr2[i]), 1);
        }
    }
    element.className = arr1.join(" ");
}

