const flow = require("lodash/fp/flow");
const log = require("../../log")(__filename);
const SelectMapOrFaction = require("./select-map-or-faction");
const {setInitiator, nextTeam} = require("./state-util");

class ChooseInitiator {
    constructor(data) {
        this.data = data;
    }

    chooseInitiator({team, user}) {
        const nextState = new SelectMapOrFaction(this.data.withMutations(
            m => flow(nextTeam, setInitiator(team))(m)
        ));

        log.info({team, user}, "User chose initiating team.");

        return nextState;
    }
}

module.exports = ChooseInitiator;