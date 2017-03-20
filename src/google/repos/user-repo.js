const _head = require("lodash/head");
const _flatten = require("lodash/flatten");
const moment = require("moment");
const GenericRepo = require("./generic-repo");

class UserRepo extends GenericRepo {
    constructor({datastore}) {
        super({
            datastore,
            kind: require("./kinds").User,
            indexes: ["steamId"],
            props: ["displayName", "steamId", "avatarUrl", "roles"],
            defaults: {"created" : () => moment().toISOString() }
        });
    }

    getBySteamId(...steamIds) {
        return Promise.all(steamIds.map(steamId => this.getBy("steamId", steamId)))
            .then(_flatten)
            .then(users => steamIds.length <= 1 ? _head(users) : users);
    }
}

module.exports = UserRepo;
