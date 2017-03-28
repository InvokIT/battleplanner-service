const isMatch = require("lodash/fp/isMatch");
const log = require("../../log")("gcs/state-changes/choose-initiator");

module.exports = (data, {initiatorTeam}) => {
    if (!isMatch(data, {name: "choose-initiator"})) {
        throw new Error("Invalid data for state-change.");
    }

    return {
        name: "selectMapOrFaction",
        team: initiatorTeam
    };
};