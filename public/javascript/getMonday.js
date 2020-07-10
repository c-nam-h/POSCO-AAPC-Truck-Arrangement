const moment = require("moment-timezone");
const now = moment().tz("America/Chicago");

function getMonday(today) {
    const day = today.day();
    const dateDifference = today.date() - day + (day === 0 ? -6:1);
    const monday = today.date(dateDifference)

    const mondayYear = today.year(); // get the current year
    const mondayMonth = today.month(); // get the current mmonth - months are 0 - 11
    const mondayDate = dateDifference; // get the date of this week's monday
    
    return [mondayYear, mondayMonth, mondayDate, monday];
}

module.exports = getMonday(now);