// toggle combo BOL NO label and input elements in request and modify pages
const comboLoadYes = document.getElementById("comboLoadYes");
const comboLoadNo = document.getElementById("comboLoadNo");

const comboBolDiv = document.getElementById("comboBolDiv");


function changeComboDivDisplayAttribute() {
    if (comboLoadYes.checked) {
        comboBolDiv.style.display = "block";
    } else {
        comboBolDiv.style.display = "none";
    }
}
