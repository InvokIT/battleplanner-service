const isString = require("lodash/fp/isString");
const uuid = require("uuid/v4");

class Match {
    constructor({id = uuid(), owner, name, active = true, players, teams} = {}) {
        if (!isString(id)) {
            throw new Error("id is not a string");
        }

        if (!isString(owner)) {
            throw new Error("owner is not a atring");
        }

        this.id = id;
        this.active = active;
        this.owner = owner;
        this.name = name;
        this.players = players;
        this.teams = teams;
    }
}

module.exports = Match;