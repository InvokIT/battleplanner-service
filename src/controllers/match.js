const matches = require("../repos/match");
const replays = require("../repos/replay");

module.exports = {
    create(match) {
        return matches.save(match);
    },

    saveReplay(matchId, round, playerId, stream) {
        return replays.save({
            matchId,
            round,
            playerId,
            stream
        });
    }
};
