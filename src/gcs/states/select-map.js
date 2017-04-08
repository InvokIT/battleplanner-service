const log = require("../../log")(__filename);
const isString = require("lodash/fp/isString");
const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const {setMap} = require("./state-util");

class SelectMap {
    constructor(data) {
        this.data = data;
    }

    selectMap({map, userId}) {
        if (!isString(map)) {
            log.error({map, userId}, "map is not a string");
            throw new Error("map is not a string");
        }

        const nextState = {
            name: "select-faction",
            data: flow(
                cloneDeep,
                setMap(map)
            )(this.data)

        };

        log.info({nextState, userId}, "User selected map");

        return nextState;
    }

}

module.exports = SelectMap;