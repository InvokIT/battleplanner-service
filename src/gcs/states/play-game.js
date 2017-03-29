const cloneDeep = require("lodash/fp/cloneDeep");
const log = require("../../log")(__filename);
const PostResultAndReplays = require("./post-result-and-replays");

class PlayGame {
    constructor(data) {
        this.data = data;
    }

    gamePlayed({user}) {
        const nextState = new PostResultAndReplays(cloneDeep(this.data));

        log.info({nextState, user}, "User said game has been played");

        return nextState;
    }
}

module.exports = PlayGame;