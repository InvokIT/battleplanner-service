const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const log = require("../../log")(__filename);
const SelectMap = require("./select-map");
const SelectFaction = require("./select-faction");
const {nextTeam, setFaction, setMap} = require("./state-util");

class SelectMapOrFaction {
    constructor(data) {
        this.data = data;
    }

    selectMap({map, user}) {
        const nextState = new SelectFaction(
            flow(
                cloneDeep,
                setMap(map),
                nextTeam
            )(this.data)
        );

        log.info({nextState, user}, "User selected map");

        return nextState;
    }

    selectFaction({faction, user}) {
        const nextState = new SelectMap(
            flow(
                cloneDeep,
                setFaction(user.id, faction),
                nextTeam
            )(this.data)
        );

        log.info({nextState, user}, "User selected faction");

        return nextState;
    }
}

module.exports = SelectMapOrFaction;