const camelCase = require("lodash/fp/camelcase");
const reduce = require("lodash/fp/reduce");
const AssignPlayersToTeams = require("./states/assign-players-to-teams");

const applyStateChange = (state, stateChange) => {
    const stateChangeName = camelCase(stateChange.name);

    if (!isString(stateChangeName)) {
        throw new Error(`stateChangeName is not a string.`);
    }

    if (!isFunction(state[stateChangeName])) {
        throw new Error(`Unknown state-change ${stateChangeName} for state '${state.constructor.name}'`);
    }

    return state[stateChangeName].call(state, stateChange.params);
};

const defaultState = new AssignPlayersToTeams(require("./states/state-util").defaultStateData);

const reduceStateChanges = reduce(applyStateChange, defaultState);

module.exports = (stateChanges) => {
    const state = reduceStateChanges(stateChanges);
    return Object.assign(
        {
            name: state.constructor.name
        },
        state.data.toJS()
    );
};