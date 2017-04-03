const isString = require("lodash/fp/isString");

class MatchStateChange {
    constructor({matchId, time, name, params} = {}) {
        if (!isString(matchId)) {
            throw new Error("matchId is not a string");
        }

        if (!isString(name)) {
            throw new Error("name is not a string");
        }

        this.matchId = matchId;
        this.time = time;
        this.name = name;
        this.params = params;
    }
}

module.exports = MatchStateChange;