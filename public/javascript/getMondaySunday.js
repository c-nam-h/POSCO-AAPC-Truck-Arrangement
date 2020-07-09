const moment = require("moment-timezone");
const now = moment().tz("America/Chicago");

function getMondaySunday(today) {
    const day = today.day();
    const dateDifference = today.date() - day + (day === 0 ? -6:1);
    const monday = today.date(dateDifference).format("l");
    const sunday = today.date(dateDifference + 6).format("l");
    return [monday, sunday];
}

module.exports = getMondaySunday(now);