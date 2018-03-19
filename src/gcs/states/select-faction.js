const cloneDeep = require("lodash/fp/cloneDeep");
const flow = require("lodash/fp/flow");
const get = require("lodash/fp/get");
const flatten = require("lodash/fp/flatten");
const findIndex = require("lodash/fp/findIndex");
const includes = require("lodash/fp/includes");
const every = require("lodash/fp/every");
const isNil = require("lodash/fp/isNil");
const isString = require("lodash/fp/isString");
const log = require("../../log")(__filename);
const {nextTeam, setFaction} = require("./state-util");

const allFactionsForPlayersTeamIsSelected = (playerId) => (stateData) => {
    const currentRound = stateData.currentRound;
    const teamId = flow(
        get("teams"),
        findIndex(t => includes(playerId)(t))
    )(stateData);

    const playerIds = flow(
        get(`teams[${teamId}]`)
    )(stateData);

    const hasPlayersSelectedFaction = every(pId => {
        return flow(
            get(`rounds[${currentRound}].factions[${pId}]`),
            isString
        )(stateData)
    })(playerIds);

    return hasPlayersSelectedFaction;
};

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

const hasMapBeenSelected = (stateData) => {
    const currentRound = stateData.currentRound;
    return flow(
        get(`rounds[${currentRound}].map`),
        m => !isNil(m)
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

        let newStateData = flow(
            cloneDeep,
            setFaction(playerId, faction)
        )(this.data);

        let nextState;

        if (hasAllPlayersChosenFaction(newStateData)) {
            nextState = {name: "play-game", data: newStateData};
        } else if (allFactionsForPlayersTeamIsSelected(playerId)(newStateData)) {
            const nextStateName = hasMapBeenSelected(newStateData) ? "select-faction" : "select-map";
            nextState = {name: nextStateName, data: nextTeam(newStateData)};
        } else {
            nextState = {name: "select-faction", data: newStateData};
        }

        log.info({nextState, userId}, "User selected faction");

        return nextState;
    }
}

module.exports = SelectFaction;