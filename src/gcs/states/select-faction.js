const cloneDeep = require("lodash/fp/cloneDeep");
const flow = require("lodash/fp/flow");
const get = require("lodash/fp/get");
const flatten = require("lodash/fp/flatten");
const every = require("lodash/fp/every");
const isNil = require("lodash/fp/isNil");
const isString = require("lodash/fp/isString");
const log = require("../../log")(__filename);
const {nextTeam, setFaction} = require("./state-util");

const hasAllPlayersChosenFaction = (stateData) => {
    const currentRound = stateData.currentRound;
    return flow(
        get("teams"),
        flatten,
        every(pId =>
            flow(
                get(`rounds[${currentRound}].factions[${pId}]`),
                isString
            )(stateData)
        )
    )(stateData);
};

class SelectFaction {
    constructor(data) {
        this.data = data;
    }

    selectFaction({playerId, faction, userId}) {
        if (!isString(faction)) {
            log.error({faction, userId}, "faction is not a string");
            throw new Error("faction is not a string");
        }

        if (isNil(playerId)) {
            playerId = userId;
        }

        const newStateData = flow(
            cloneDeep,
            setFaction(playerId, faction), nextTeam
        )(this.data);

        let nextState;

        if (hasAllPlayersChosenFaction(newStateData)) {
            nextState = {name: "play-game", data: newStateData};
        } else {
            nextState = {name: "select-faction", data: newStateData};
        }

        log.info({nextState, userId}, "User selected faction");

        return nextState;
    }
}

module.exports = SelectFaction;