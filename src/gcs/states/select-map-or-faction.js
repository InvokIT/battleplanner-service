const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const isString = require("lodash/fp/isString");
const isNil = require("lodash/fp/isNil");
const log = require("../../log")(__filename);
const {nextTeam, setFaction, setMap} = require("./state-util");

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

        const nextState = {
            name: "select-map",
            data: flow(
                cloneDeep,
                setFaction(playerId, faction),
                nextTeam
            )(this.data)
        };

        log.info({nextState, userId}, "User selected faction");

        return nextState;
    }
}

module.exports = SelectMapOrFaction;