const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const every = require("lodash/fp/every");
const isNumber = require("lodash/fp/isNumber");
const isString = require("lodash/fp/isString");
const isUndefined = require("lodash/fp/isUndefined");
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
        if (!isNumber(team)) {
            throw new Error("Invalid team value.");
        }

        if (!isNumber(teamSlot)) {
            throw new Error("Invalid teamSlot value.");
        }

        if (isUndefined(playerId)) {
            throw new Error("Invalid playerId value.");
        }

        const nextState =  {
            name: "assign-players-to-teams",
            data: flow(
                cloneDeep,
                updateTeamPlayerSlot(team, teamSlot, playerId)
            )(this.data)
        };

        log.info({nextState, team, playerId, user}, "User assigned player to team.");

        return nextState;
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