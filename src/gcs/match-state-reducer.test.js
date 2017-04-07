const matchStateReducer = require("./match-state-reducer");

describe("match-state-reducer", () => {

    const firstStateChange = {
        name: "update-team-player-slot",
        params: {team: 0, teamSlot: 0, playerId: "p1", user: {id: "p0"}}
    };

    it("should assume the default state if none is given", () => {
        const state = matchStateReducer([firstStateChange]);
        expect(state).to.have.property("name", "assign-players-to-teams");
    });

    it("should reduce some state-changes to a state", () => {
        const stateChanges = [
            firstStateChange,
            {
                name: "update-team-player-slot",
                params: {team: 1, teamSlot: 0, playerId: "p2", user: {id: "p0"}}
            },
            {
                name: "teams-complete",
                params: {user: {id: "p0"}}
            },
            {
                name: "choose-initiator",
                params: {team: 1, user: {id: "p0"}}
            }
        ];

        const state = matchStateReducer(stateChanges);
        expect(state).to.have.property("name", "select-map-or-faction");
    });

});