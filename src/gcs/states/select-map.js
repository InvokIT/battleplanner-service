const log = require("../../log")(__filename);
const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const SelectFaction = require("./select-faction");
const {setMap} = require("./state-util");

class SelectMap {
    constructor(data) {
        this.data = data;
    }

    selectMap({map, user}) {
        const nextState = new SelectFaction(
            flow(
                cloneDeep,
                setMap(map)
            )(this.data)
        );

        log.info({nextState, user}, "User selected map");

        return nextState;
    }

}

module.exports = SelectMap;