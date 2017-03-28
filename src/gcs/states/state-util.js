const log = require("../../log")(__filename);
const times = require("lodash/fp/times");
const flow = require("lodash/fp/flow");
const toNumber = require("lodash/fp/toNumber");

function getRoundInitiator(data) {
    const currentRound = data.get("currentRound");
    const roundCount = data.get("rounds").size;

    if (currentRound === roundCount - 1) {
        // Final game, choose initiator based on VP count
        return flow(
            data => data.get("rounds").reduce(
                (scores, r) => scores.update(r.winner, (v = 0) => v + r.winnerVictoryPoints),
                immutableMap()
            ).sort().keySeq().last(),
            toNumber
        )(data);
    } else {
        // Alternating initiator
        const initiator = data.get("initiator");
        return (initiator + currentRound) % 2;
    }
}

module.exports = {
    defaultStateData: immutableMap({
        teams: [[], []], // Array of array of player ids,
        initiator: null, // Team that chooses first
        currentTeam: null, // Team making the current choice
        currentRound: 0,
        rounds: times(() => ({
            factions: {}, // Map of user-id to faction,
            map: null, // Selected map
            winner: null, // winner team number
            winnerVictoryPoints: null, // Victory points of winner
            replayUploaded: {} // Map of user-id to boolean
        }), 5)
    }),

    updateTeamPlayerSlot(team, teamSlot, playerId, stateData) {
        log.trace({team, teamSlot, playerId, stateData}, "updateTeamPlayerSlot");

        return stateData.setIn(["teams", team, teamSlot], playerId);
    },

    setFaction(playerId, faction, stateData) {
        log.trace({playerId, faction, stateData}, "setFaction");

        const currentRound = stateData.get("currentRound");
        return stateData.setIn(["rounds", currentRound, "factions", playerId], faction);
    },

    setMap(map, stateData) {
        log.trace({map, stateData}, "setMap");

        const currentRound = stateData.get("currentRound");
        return stateData.setIn(["rounds", currentRound, "map"], map);
    },

    nextTeam(stateData) {
        log.trace({stateData}, "nextTeam");

        return stateData.set("currentTeam", (stateData.get("currentTeam") + 1) % 2);
    },

    setInitiator(initiator, stateData) {
        log.trace({initiator, stateData}, "setInitiator");

        return stateData.set("initiator", initiator);
    },

    setWinner(winnerTeam, victoryPoints, stateData) {
        log.trace({winnerTeam, victoryPoints, stateData}, "setWinner");

        const currentRound = stateData.get("currentRound");
        return stateData.withMutations(d => d
            .setIn(["rounds", currentRound, "winner"], winnerTeam)
            .setIn(["rounds", currentRound, "winnerVictoryPoints"], victoryPoints)
        );
    },

    setReplayUploaded(userId, value, stateData) {
        log.trace({userId, stateData}, "setReplayUploaded");

        const currentRound = stateData.get("currentRound");
        return stateData.setIn(["rounds", currentRound, "replays", userId], value);
    },

    nextRound(stateData) {
        log.trace({stateData}, "nextRound");

        const currentRound = stateData.get("currentRound") + 1;
        return stateData.withMutations(d => d
            .set("currentRound", currentRound)
            .set("currentTeam", getRoundInitiator(d))
        );
    }
};