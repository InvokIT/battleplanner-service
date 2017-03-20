const _head = require("lodash/head");
const repos = require("./repos.config");

const matchRepo = {
    get(id) {
        return repos.match.get(id);
    },

    save(match) {
        return repos.match.save(match);
    }
};

module.exports = matchRepo;