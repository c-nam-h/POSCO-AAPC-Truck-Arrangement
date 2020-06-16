const selectShipTo = document.getElementById("selectShipTo");

let customer_destination_ship_to = new Array;
let customer_destination_ship_to_id = new Array;

for (var i = 0; i < selectShipTo.length; i++) {
    customer_destination_ship_to.push([[selectShipTo[i].value],[]]);
    customer_destination_ship_to_id.push([[selectShipTo[i].value],[]]);
};

const selectShipToAddress = document.getElementById("selectShipToAddress");
for (var i = 0; i < selectShipToAddress.length; i++) {
    for (var j = 0; j < customer_destination_ship_to.length; j++) {
        if (customer_destination_ship_to[j][0] == selectShipToAddress[i].getAttribute("customer_id")) {
            customer_destination_ship_to[j][1].push(selectShipToAddress[i].text);
            customer_destination_ship_to_id[j][1].push(selectShipToAddress[i].value);
            break;
        };
    };
};

let destinations_ship_to = {};
let destinations_ship_to_id = {};

for (var i = 0; i < customer_destination_ship_to.length; i++) {
    destinations_ship_to[customer_destination_ship_to[i][0]] = customer_destination_ship_to[i][1];
    destinations_ship_to_id[customer_destination_ship_to_id[i][0]] = customer_destination_ship_to_id[i][1];
};

selectShipTo.addEventListener("change", function() {
    const selectedDestination = destinations_ship_to[this.value];
    const selectedDestination_id = destinations_ship_to_id[this.value];

    let selectShipToDestination_final = {};

    for (var i = 0; i < selectedDestination.length; i++) {
        selectShipToDestination_final[selectedDestination[i]] = selectedDestination_id[i];
    };

    while (selectShipToAddress.length > 0) {
        selectShipToAddress.options.remove(0);
    }

    let option = new Option("Select Ship To Address", "Select Ship To Address");
    selectShipToAddress.appendChild(option);
    

    Array.from(selectedDestination).forEach(function(element) {
        option = new Option(element, selectShipToDestination_final[element]);

        selectShipToAddress.appendChild(option);
    })

});
