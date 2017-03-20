const _head = require("lodash/head");
const _flatten = require("lodash/flatten");
const GenericRepo = require("./generic-repo");
const kinds = require("./kinds");

class MatchRepo extends GenericRepo {
    constructor({datastore}) {
        super({
            datastore,
            kind: kinds.Match,
            indexes: ["playerIds"],
            props: ["playerIds", "created"],
            refs: { "playerIds": kinds.User },
            defaults: {"created" : () => Date.now() }
        });
    }

    getByPlayerId(playerId) {
        return this.getBy("playerIds", playerId);
    }
}

export default MatchRepo;