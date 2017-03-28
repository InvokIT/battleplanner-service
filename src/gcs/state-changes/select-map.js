const isMatch = require("lodash/fp/isMatch");
const log = require("../../log")("gcs/state-changes/select-map");
// TODO
module.exports = (state, {initiatorTeam}) => {
    if (!isMatch(state, {name: "choose-initiator"})) {
        throw new Error("Invalid state for state-change.");
    }

    return {
        name: "selectMapOrFaction",
        team: initiatorTeam
    };
};