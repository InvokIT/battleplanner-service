const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const log = require("../../log")(__filename);
const {nextRound} = require("./state-util");

class PlayGame {
    constructor(data) {
        this.data = data;
    }

    continue({userId}) {
        // TODO This is a short-circuit to skip post-result-and-replays state
        return {
            name: "select-faction",
            data: flow(
                cloneDeep,
                nextRound
            )(this.data)
        };

        const nextState = {
            name: "post-result-and-replays",
            data: cloneDeep(this.data)
        };

        log.info({nextState, userId}, "User said game has been played");

        return nextState;
    }
}

module.exports = PlayGame;