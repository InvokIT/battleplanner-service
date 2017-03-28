const AssignPlayersToTeams = require("./assign-players-to-teams");
const defaultStateData = require("./state-util").defaultStateData;

const user = {id: "test-user"};

describe("AssignPlayersToTeams", () => {

    describe("updateTeamPlayerSlot", () => {

        it("should add a player to a team", () => {
            const state = new AssignPlayersToTeams(defaultStateData);
            const playerId = "12345";
            state.updateTeamPlayerSlot({team: 0, teamSlot: 0, playerId, user});

            expect(state.data.getIn(["teams", 0, 0])).to.equal(playerId);
        });

        it("should change a player assignment in a team", () => {
            const state = new AssignPlayersToTeams(
                defaultStateData.setIn(["teams", 0, 0], "old-player")
            );

            const playerId = "12345";
            state.updateTeamPlayerSlot({team: 0, teamSlot: 0, playerId, user});

            expect(state.data.getIn(["teams", 0, 0])).to.equal(playerId);
        });

        it("should clear a player assignment in a team", () => {
            const state = new AssignPlayersToTeams(
                defaultStateData.setIn(["teams", 0, 0], "old-player")
            );

            const playerId = null;
            state.updateTeamPlayerSlot({team: 0, teamSlot: 0, playerId, user});

            expect(state.data.getIn(["teams", 0, 0])).to.equal(playerId);
        });

    });
});