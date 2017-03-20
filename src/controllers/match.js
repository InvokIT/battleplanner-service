const matches = require("../repos/match");

module.exports = {
    create(match) {
        return matches.save(match);
    }
};
