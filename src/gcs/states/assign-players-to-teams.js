const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const every = require("lodash/fp/every");
const log = require("../../log")(__filename);
const {updateTeamPlayerSlot} = require("./state-util");

function allTeamsHasPlayers(data) {
    return every(t => t.length > 0)(data.teams);
}

class AssignPlayersToTeams {
    constructor(data) {
        this.data = data;
    }

    updateTeamPlayerSlot({team, teamSlot, playerId, user}) {
        log.info({team, playerId, user}, "User assigned player to team.");

        return {
            name: "assign-players-to-teams",
            data: flow(
                cloneDeep,
                updateTeamPlayerSlot(team, teamSlot, playerId)
            )(this.data)
        };
    }

    teamsComplete({user}) {
        if (!allTeamsHasPlayers(this.data)) {
            log.error({user, state: this.data}, "Cannot complete teams. Not all teams has players.");
            throw new Error("Cannot complete teams. Not all teams has players.");
        }

        log.info({user}, "User completed team assignment.");
        return {
            name: "choose-initiator",
            data: cloneDeep(this.data)
        };
    }
}

module.exports = AssignPlayersToTeams;