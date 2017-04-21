const camelCase = require("lodash/fp/camelCase");
const isString = require("lodash/fp/isString");
const isFunction = require("lodash/fp/isFunction");
const reduce = require("lodash/fp/reduce");
const log = require("../log")(__filename);

const stateClasses = {
    "assign-players-to-teams": require("./states/assign-players-to-teams"),
    "choose-initiator": require("./states/choose-initiator"),
    "play-game": require("./states/play-game"),
    "post-result-and-replays": require("./states/post-result-and-replays"),
    "select-faction": require("./states/select-faction"),
    "select-map": require("./states/select-map"),
    "select-map-or-faction": require("./states/select-map-or-faction"),
    "game-over": require("./states/game-over")
};

const applyStateChange = (state, stateChange) => {
    log.info({state, stateChange}, "Applying stateChange to state");

    const stateChangeName = camelCase(stateChange.name);

    if (!isString(stateChangeName)) {
        throw new Error(`stateChangeName is not a string.`);
    }

    const stateInstance = new (stateClasses[state.name])(state.data);

    if (!isFunction(stateInstance[stateChangeName])) {
        throw new Error(`Unknown state-change ${stateChangeName} for state '${state.name}'`);
    }

    const newState = stateInstance[stateChangeName].call(stateInstance, stateChange.params);
    return newState;
};

const defaultState = {
    name: "assign-players-to-teams",
    data: require("./states/state-util").defaultStateData
};

const reduceStateChanges = (stateChanges, state = defaultState) => reduce(applyStateChange, state)(stateChanges);

module.exports = (stateChanges, state) => {
    return reduceStateChanges(stateChanges, state);
};