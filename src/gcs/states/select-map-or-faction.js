const every = require("lodash/fp/every");
const flow = require("lodash/fp/flow");
const get = require("lodash/fp/get");
const findIndex = require("lodash/fp/findIndex");
const includes = require("lodash/fp/includes");
const cloneDeep = require("lodash/fp/cloneDeep");
const isString = require("lodash/fp/isString");
const isNil = require("lodash/fp/isNil");
const log = require("../../log")(__filename);
const {nextTeam, setFaction, setMap} = require("./state-util");

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

class SelectMapOrFaction {
    constructor(data) {
        this.data = data;
    }

    selectMap({map, userId}) {
        if (!isString(map)) {
            log.error({map, userId}, "Invalid map value.");
            throw new Error("Invalid map value.");
        }

        const nextState = {
            name: "select-faction",
            data: flow(
                cloneDeep,
                setMap(map),
                nextTeam
            )(this.data)
        };

        log.info({nextState, userId}, "User selected map");

        return nextState;
    }

    selectFaction({playerId, faction, userId}) {
        if (!isString(faction)) {
            log.error({faction, userId}, "Invalid faction value.");
            throw new Error("Invalid faction value.");
        }

        if (isNil(playerId)) {
            playerId = userId;
        }

        let data = cloneDeep(this.data);
        data = setFaction(playerId, faction)(data);

        let nextState = null;
        // If all factions for the current player's team has been selected, next state is selectMap for the opposing team
        if (allFactionsForPlayersTeamIsSelected(playerId)(data)) {
            nextState = {
                name: "select-map",
                data: nextTeam(data)
            };
        } else {
            // else state is selectFaction for this team
            nextState = {
                name: "select-faction",
                data: data
            };
        }

        log.info({data: this.data, nextState, userId}, "User selected faction");

        return nextState;
    }
}

module.exports = SelectMapOrFaction;