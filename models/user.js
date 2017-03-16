const uuid = require("uuid/v4");
const repos = require("./models.config").repos;

class User {
    constructor() {
        this.id = uuid();
    }

    save() {
        return repos.user.save(this);
    }
}

const userFacade = {
    getById(id) {
        return repos.user.getById(id);
    },

    findOneBySteamId(steamId) {
        return repos.user.findOneBySteamId(steamId);
    },

    create() {
        return new User();
    }
};

module.exports = userFacade;