const log = require("../../log")(__filename);
const SelectFaction = require("./select-faction");
const {setMap} = require("./state-util");

class SelectMap {
    constructor(data) {
        this.data = data;
    }

    selectMap({map, user}) {
        const nextState = new SelectFaction(setMap(map, this.data));

        log.info({nextState, user}, "User selected map");

        return nextState;
    }

}

module.exports = SelectMap;