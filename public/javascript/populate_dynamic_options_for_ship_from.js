const selectShipFrom = document.getElementById("selectShipFrom");

let customer_destination_ship_from = new Array;
let customer_destination_ship_from_id = new Array;

for (var i = 0; i < selectShipFrom.length; i++) {
    customer_destination_ship_from.push([[selectShipFrom[i].value],[]]);
    customer_destination_ship_from_id.push([[selectShipFrom[i].value],[]]);
};

const selectShipFromAddress = document.getElementById("selectShipFromAddress");
for (var i = 0; i < selectShipFromAddress.length; i++) {
    for (var j = 0; j < customer_destination_ship_from.length; j++) {
        if (customer_destination_ship_from[j][0] == selectShipFromAddress[i].getAttribute("customer_id")) {
            customer_destination_ship_from[j][1].push(selectShipFromAddress[i].text);
            customer_destination_ship_from_id[j][1].push(selectShipFromAddress[i].value);
            break;
        };
    };
};

let destinations_ship_from = {};
let destinations_ship_from_id = {};

for (var i = 0; i < customer_destination_ship_from.length; i++) {
    destinations_ship_from[customer_destination_ship_from[i][0]] = customer_destination_ship_from[i][1];
    destinations_ship_from_id[customer_destination_ship_from_id[i][0]] = customer_destination_ship_from_id[i][1];
};

selectShipFrom.addEventListener("change", function() {
    const selectedDestination = destinations_ship_from[this.value];
    const selectedDestination_id = destinations_ship_from_id[this.value];

    let selectShipFromDestination_final = {};

    for (var i = 0; i < selectedDestination.length; i++) {
        selectShipFromDestination_final[selectedDestination[i]] = selectedDestination_id[i];
    };

    while (selectShipFromAddress.length > 0) {
        selectShipFromAddress.options.remove(0);
    }
    
    let option = new Option("Select Ship From Address", "");
    selectShipFromAddress.appendChild(option);
    

    Array.from(selectedDestination).forEach(function(element) {
        option = new Option(element, selectShipFromDestination_final[element]);

        selectShipFromAddress.appendChild(option);
    })

});
