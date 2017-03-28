const isMatch = require("lodash/fp/isMatch");
const log = require("../../log")("gcs/state-changes/initial-state");

module.exports = (state) => {
    if (!isMatch(state, {name: undefined})) {
        throw new Error("Invalid state for state-change.");
    }

    return {
        name: "choose-initiator"
    };
};