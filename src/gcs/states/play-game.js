const cloneDeep = require("lodash/fp/cloneDeep");
const log = require("../../log")(__filename);

class PlayGame {
    constructor(data) {
        this.data = data;
    }

    gamePlayed({userId}) {
        const nextState = {
            name: "post-result-and-replays",
            data: cloneDeep(this.data)
        };

        log.info({nextState, userId}, "User said game has been played");

        return nextState;
    }
}

module.exports = PlayGame;