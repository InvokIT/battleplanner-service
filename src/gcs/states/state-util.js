const log = require("../../log")(__filename);
const times = require("lodash/fp/times");
const flow = require("lodash/fp/flow");
const set = require("lodash/fp/set");
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
    defaultStateData: {
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
    },

    updateTeamPlayerSlot(team, teamSlot, playerId, stateData) {
        log.trace({team, teamSlot, playerId, stateData}, "updateTeamPlayerSlot");

        return set(`teams[${team}][${teamSlot}]`, playerId)(stateData);
    },

    setFaction(playerId, faction, stateData) {
        log.trace({playerId, faction, stateData}, "setFaction");

        const currentRound = stateData.currentRound;

        return set(`rounds[${currentRound}].factions[${playerId}]`, faction)(stateData);
    },

    setMap(map, stateData) {
        log.trace({map, stateData}, "setMap");

        const currentRound = stateData.currentRound;
        return set(`rounds[${currentRound}].map`, map)(stateData);
    },

    nextTeam(stateData) {
        log.trace({stateData}, "nextTeam");

        stateData.currentTeam = (stateData.currentTeam + 1) % 2;
        return stateData;
    },

    setInitiator(initiator, stateData) {
        log.trace({initiator, stateData}, "setInitiator");

        stateData.initiator = initiator;
        return stateData;
    },

    setWinner(winnerTeam, victoryPoints, stateData) {
        log.trace({winnerTeam, victoryPoints, stateData}, "setWinner");

        const currentRound = stateData.currentRound;
        return flow(
            set(`rounds[${currentRound}].winner`, winnerTeam),
            set(`rounds[${currentRound}].winnerVictoryPoints`, victoryPoints)
        )(stateData);
    },

    setReplayUploaded(userId, value, stateData) {
        log.trace({userId, value, stateData}, "setReplayUploaded");

        const currentRound = stateData.currentRound;
        return set(`rounds[${currentRound}].replays[${userId}]`, value)(stateData);
    },

    nextRound(stateData) {
        log.trace({stateData}, "nextRound");

        const currentRound = stateData.currentRound + 1;

        return flow(
            set("currentRound", currentRound),
            data => set("currentTeam", getRoundInitiator(data))(data)
        )(stateData);
    }
};