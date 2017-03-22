const matches = require("../repos/match");
const replays = require("../repos/replay");
const User = require("../models/user");
const Match = require("../models/match");

module.exports = {
    create(matchArgs) {
        return matches.save(new Match(matchArgs));
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
        const allMatches = user.roles.includes(User.ROLES.matchAdmin);
        if (allMatches) {
            return matches.getActive();
        } else {
            return matches.getActiveByPlayerId(user.id);
        }
    }
};
