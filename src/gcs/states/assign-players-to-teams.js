const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const every = require("lodash/fp/every");
const isNumber = require("lodash/fp/isNumber");
const isString = require("lodash/fp/isString");
const isUndefined = require("lodash/fp/isUndefined");
const log = require("../../log")(__filename);
const {updateTeamPlayerSlot} = require("./state-util");
const matchRepo = require("../../repos/match");

function allTeamsHasPlayers(data) {
    return every(t => t.length > 0)(data.teams);
}

class AssignPlayersToTeams {
    constructor(data) {
        this.data = data;
    }

    updateTeamPlayerSlot({team, teamSlot, playerId, userId}) {
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

        log.info({nextState, team, playerId, userId}, "User assigned player to team.");

        return nextState;
    }

    teamsComplete({userId}) {
        if (!allTeamsHasPlayers(this.data)) {
            log.error({userId, state: this.data}, "Cannot complete teams. Not all teams has players.");
            throw new Error("Cannot complete teams. Not all teams has players.");
        }

        log.info({userId}, "User completed team assignment.");

        return {
            name: "choose-initiator",
            data: cloneDeep(this.data)
        };
    }
}

module.exports = AssignPlayersToTeams;