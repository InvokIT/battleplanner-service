const log = require("../../log")(__filename);
const times = require("lodash/fp/times");
const flow = require("lodash/fp/flow");
const isNil = require("lodash/fp/isNil");
const set = require("lodash/fp/set");
const get = require("lodash/fp/get");
const size = require("lodash/fp/size");
const update = require("lodash/fp/update");
const reduce = require("lodash/fp/reduce");
const toNumber = require("lodash/fp/toNumber");
const forEach = require("lodash/fp/forEach");
const map = require("lodash/fp/map");
const uniq = require("lodash/fp/uniq");
const sortBy = require("lodash/fp/sortBy");
const head = require("lodash/fp/head");
const filter = require("lodash/fp/filter");
const maps = require("../maps");

function getRoundInitiator(data) {
    const currentRound = data.currentRound;
    const roundCount = data.rounds.length;

    if (currentRound === roundCount - 1) {
        // Final game, choose initiator based on VP count
        return flow(
            get("rounds"),
            reduce((scores, round) => {
                if (!isNil(round.winner)) {
                    scores[round.winner] += round.winnerVictoryPoints;
                }
                return scores;
                // return update(round.winner, (vps = 0) => vps + round.winnerVictoryPoints)(scores);
            }, [0, 0]),
            scores => scores.reduce((leader, vps, team) => {
                if (leader.vps > vps) {
                    return leader;
                } else if (leader.vps < vps) {
                    return {team, vps};
                } else {
                    return {team: -1, vps};
                }
            }, {vps: -1}),
            get("team")
        )(data);
    } else {
        // 0, 1, 1, 0, 0, 1, 1, 0...
        const roundPair = Math.floor(currentRound / 2);
        let roundInitiator = (data.initiator + currentRound) % 2;
        if (roundPair % 2 === 1) {
            roundInitiator = (roundInitiator + 1) % 2;
        }

        return roundInitiator;
    }
}

const setMapByRules = (stateData) => {
    const currentRound = stateData.currentRound;
    const rounds = stateData.rounds;

    // TODO Separate GCS and UTT code
    // In UTT players always select the map
    if (currentRound % 2 === 1) {
        // Same map as previous round
        const previousMap = get(`rounds[${currentRound - 1}].map`)(stateData);
        return set(`rounds[${currentRound}].map`, previousMap)(stateData);
    } else {
        // Let the players select
        return stateData;
    }
};

module.exports = {
    createRoundsStateData: (roundCount) => times(() => ({
        factions: {}, // Map of user-id to faction,
        map: null, // Selected map
        winner: null, // winner team number
        winnerVictoryPoints: null, // Victory points of winner
        replayUploaded: {} // Map of user-id to boolean
    }), roundCount),

    defaultStateData: {
        teams: [[null], [null]], // Array of array of player ids,
        initiator: null, // Team that chooses first
        currentTeam: null, // Team making the current choice
        currentRound: 0,
        rounds: []
    },

    updateTeamPlayerSlot(team, teamSlot, playerId, stateData) {
        if (arguments.length < 4) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({team, teamSlot, playerId, stateData}, "updateTeamPlayerSlot");

        return set(`teams[${team}][${teamSlot}]`, playerId)(stateData);
    },

    removePlayerFromTeams(playerId, stateData) {
        if (arguments.length < 2) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({playerId, stateData}, "removePlayerFromTeams");

        flow(
            get("teams"),
            forEach(team => {
                team.forEach((pId, index) => {
                    if (playerId === pId) {
                        team[index] = null;
                    }
                });
            })
        )(stateData);

        return stateData;
    },

    setFaction(playerId, faction, stateData) {
        if (arguments.length < 3) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({playerId, faction, stateData}, "setFaction");

        const currentRound = stateData.currentRound;

        return set(`rounds[${currentRound}].factions[${playerId}]`, faction)(stateData);
    },

    setMap(map, stateData) {
        if (arguments.length < 2) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({map, stateData}, "setMap");

        const currentRound = stateData.currentRound;
        const roundCount = flow(get("rounds"), size)(stateData);

        stateData = set(`rounds[${currentRound}].map`, map)(stateData);

        // // Also set map for the next round; players merely switch positions
        // if (currentRound + 1 < roundCount) {
        //     stateData = set(`rounds[${currentRound + 1}].map`, map)(stateData);
        // }

        return stateData;
    },

    nextTeam(stateData) {
        if (arguments.length < 1) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({stateData}, "nextTeam");

        stateData.currentTeam = (stateData.currentTeam + 1) % 2;
        return stateData;
    },

    setCurrentTeam(team, stateData) {
        if (arguments.length < 2) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({team, stateData}, "setCurrentTeam");

        stateData.currentTeam = team;
        return stateData;
    },

    setInitiator(initiator, stateData) {
        if (arguments.length < 2) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({initiator, stateData: stateData}, "setInitiator");

        stateData.initiator = initiator;
        return stateData;
    },

    setWinner(winnerTeam, victoryPoints, stateData) {
        if (arguments.length < 3) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({winnerTeam, victoryPoints, stateData}, "setWinner");

        const currentRound = stateData.currentRound;
        return flow(
            set(`rounds[${currentRound}].winner`, winnerTeam),
            set(`rounds[${currentRound}].winnerVictoryPoints`, victoryPoints)
        )(stateData);
    },

    setReplayUploaded(userId, value, stateData) {
        if (arguments.length < 3) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({userId, value, stateData}, "setReplayUploaded");

        const currentRound = stateData.currentRound;
        return set(`rounds[${currentRound}].replayUploaded[${userId}]`, value)(stateData);
    },

    nextRound(stateData) {
        if (arguments.length < 1) {
            return arguments.callee.bind(null, ...arguments);
        }

        log.trace({stateData}, "nextRound");

        const currentRound = stateData.currentRound + 1;

        return flow(
            set("currentRound", currentRound),
            data => set("currentTeam", getRoundInitiator(data))(data),
            setMapByRules
        )(stateData);
    }
};