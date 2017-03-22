const uuid = require("uuid/v4");

class Match {
    constructor({id = uuid(), active, players} = {}) {
        this.id = id;
        this.active = active;
        this.players = players;
    }
}

module.exports = Match;