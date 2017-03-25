const uuid = require("uuid/v4");
const flow = require("lodash/fp/flow");
const get = require("lodash/fp/get");
const includes = require("lodash/fp/includes");
const matches = require("../repos/match");
const replays = require("../repos/replay");
const User = require("../models/user");
const Match = require("../models/match");
const log = require("../log")("controllers/match");

const isMatchAdmin = flow(
    get("roles"),
    includes("matchAdmin")
);

module.exports = {
    create(matchArgs) {
        return Promise.resolve()
            .then(() => new Match(Object.assign({id: uuid()}, matchArgs)))
            .then(m => matches.save(m))
            .then(m => {
                log.debug({match: m}, "Created match");
                return m;
            });
    },

    saveReplay(matchId, round, playerId, stream) {
        return replays.save({
            matchId,
            round,
            playerId,
            stream
        });
    },

    getMatchesForUser(user) {
        const allMatches = isMatchAdmin(user);
        if (allMatches) {
            return matches.getActive();
        } else {
            return matches.getActiveByPlayerId(user.id);
        }
    }
};
