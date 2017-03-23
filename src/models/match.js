const isString = require("lodash/fp/isString");
const uuid = require("uuid/v4");

class Match {
    constructor({id = uuid(), owner, active = true, players} = {}) {
        if (!isString(id)) {
            throw new Error("id is not a string");
        }

        if (!isString(owner)) {
            throw new Error("owner is not a atring");
        }

        this.id = id;
        this.active = active;
        this.owner = owner;
        this.players = players;
    }
}

module.exports = Match;