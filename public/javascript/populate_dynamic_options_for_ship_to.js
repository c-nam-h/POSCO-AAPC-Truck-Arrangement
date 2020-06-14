const selectShipTo = document.getElementById("selectShipTo");

let customer_destination_ship_to = new Array;

for (var i = 0; i < selectShipTo.length; i++) {
    customer_destination_ship_to.push([[selectShipTo[i].value],[]]);
};

const selectShipToAddress = document.getElementById("selectShipToAddress");
for (var i = 0; i < selectShipToAddress.length; i++) {
    for (var j = 0; j < customer_destination_ship_to.length; j++) {
        if (customer_destination_ship_to[j][0] == selectShipToAddress[i].getAttribute("customer_id")) {
            customer_destination_ship_to[j][1].push(selectShipToAddress[i].text);
            break;
        };
    };
};

let destinations_ship_to = {};

for (var i = 0; i < customer_destination_ship_to.length; i++) {
    destinations_ship_to[customer_destination_ship_to[i][0]] = customer_destination_ship_to[i][1];
};

selectShipTo.addEventListener("change", function() {
    const selectedDestination = destinations_ship_to[this.value];

    while (selectShipToAddress.length > 0) {
        selectShipToAddress.options.remove(0);
    }

    let option = new Option("Select Ship To Address", "Select Ship To Address");
    selectShipToAddress.appendChild(option);
    
    Array.from(selectedDestination).forEach(function(element) {
        option = new Option(element, element);

        selectShipToAddress.appendChild(option);
    })

});
