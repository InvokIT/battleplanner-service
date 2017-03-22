const uuid = require("uuid/v4");

class User {
    static get ROLES() {
        matchAdmin: "matchAdmin"
    };

    constructor({id = uuid(), steamId, avatarUrl, displayName, roles} = {}) {
        this.id = id;
        this.steamId = steamId;
        this.avatarUrl = avatarUrl;
        this.displayName = displayName;
        this.roles = roles;
    }
}

module.exports = User;