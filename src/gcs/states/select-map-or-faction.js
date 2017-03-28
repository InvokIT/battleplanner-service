const flow = require("lodash/fp/flow");
const log = require("../../log")(__filename);
const SelectMap = require("./select-map");
const SelectFaction = require("./select-faction");
const {nextTeam, setFaction, setMap} = require("./state-util");

class SelectMapOrFaction {
    constructor(data) {
        this.data = data;
    }

    selectMap({map, user}) {
        const nextState = new SelectFaction(this.data.withMutations(
            m => flow(setMap(map), nextTeam)(m)
        ));

        log.info({nextState, user}, "User selected map");

        return nextState;
    }

    selectFaction({faction, user}) {
        const nextState = new SelectMap(this.data.withMutations(
            m => flow(setFaction(user.id, faction), nextTeam)(m)
        ));

        log.info({nextState, user}, "User selected faction");

        return nextState;
    }
}

module.exports = SelectMapOrFaction;