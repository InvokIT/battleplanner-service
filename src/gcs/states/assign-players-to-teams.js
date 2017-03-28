const flow = require("lodash/fp/flow");
const every = require("lodash/fp/every");
const log = require("../../log")(__filename);
const ChooseInitiator = require("./choose-initiator");
const {updateTeamPlayerSlot} = require("./state-util");

function allTeamsHasPlayers(data) {
    return every(t => t.length > 0)(data.teams);
}

class AssignPlayersToTeams {
    constructor(data) {
        this.data = data;
    }

    updateTeamPlayerSlot({team, teamSlot, playerId, user}) {
        this.data = updateTeamPlayerSlot(team, teamSlot, playerId, this.data);

        log.info({team, playerId, user}, "User assigned player to team.");

        return this;
    }

    teamsComplete({user}) {
        if (!allTeamsHasPlayers(this.data)) {
            log.error({user, state: this.data}, "Cannot complete teams. Not all teams has players.");
            throw new Error("Cannot complete teams. Not all teams has players.");
        }

        log.info({user}, "User completed team assignment.");
        return new ChooseInitiator(this.data);
    }
}

module.exports = AssignPlayersToTeams;