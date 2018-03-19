const uuid = require("uuid/v4");
const flow = require("lodash/fp/flow");
const get = require("lodash/fp/get");
const includes = require("lodash/fp/includes");
const series = require("async/series");
const moment = require("moment");
const matches = require("../repos/match");
const replays = require("../repos/replay");
const matchStateChangeRepo = require("../repos/match-state-change");
const User = require("../models/user");
const Match = require("../models/match");
const MatchStateChange = require("../models/match-state-change");
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
                // Create match state changes that changes the round and player count and store to db
                return new Promise((resolve, reject) => {
                    series([
                        (done) => matchStateChangeRepo.save(new MatchStateChange({
                            matchId: m.id,
                            time: moment().toISOString(),
                            name: "applyMatchOptions",
                            params: {roundCount: m.roundCount, playerCount: m.playerCount}
                        })).then(() => done()).catch(e => done(e)),

                        (done) => matchStateChangeRepo.save(new MatchStateChange({
                            matchId: m.id,
                            time: moment().toISOString(),
                            name: "continue",
                            params: {}
                        })).then(() => done()).catch(e => done(e)),

                        (done) => {
                            resolve(m);
                            done();
                        }
                    ]);
                });
            })
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

    getMatch(user, matchId) {
        return matches.get({id: matchId});
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
