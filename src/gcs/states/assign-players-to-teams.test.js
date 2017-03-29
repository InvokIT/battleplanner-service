const cloneDeep = require("lodash/fp/cloneDeep");
const flow = require("lodash/fp/flow");
const set = require("lodash/fp/set");
const AssignPlayersToTeams = require("./assign-players-to-teams");
const defaultStateData = require("./state-util").defaultStateData;

const user = {id: "test-user"};

describe("AssignPlayersToTeams", () => {

    describe("updateTeamPlayerSlot", () => {

        it("should add a player to a team", () => {
            const state = new AssignPlayersToTeams(cloneDeep(defaultStateData));
            const playerId = "12345";
            const nextState = state.updateTeamPlayerSlot({team: 0, teamSlot: 0, playerId, user});

            return expect(nextState).to.have.deep.property("data.teams[0][0]", playerId);
        });

        it("should change a player assignment in a team", () => {
            const state = new AssignPlayersToTeams(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "old-players")
                )(defaultStateData)
            );

            const playerId = "12345";
            const nextState = state.updateTeamPlayerSlot({team: 0, teamSlot: 0, playerId, user});

            return expect(nextState).to.have.deep.property("data.teams[0][0]", playerId);
        });

        it("should clear a player assignment in a team", () => {
            const state = new AssignPlayersToTeams(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "old-player")
                )(defaultStateData)
            );

            const playerId = null;
            const nextState = state.updateTeamPlayerSlot({team: 0, teamSlot: 0, playerId, user});

            return expect(nextState).to.have.deep.property("data.teams[0][0]", playerId);
        });

    });

    describe("teamsComplete", () => {
        it("should throw when no teams has players yet", () => {
            const state = new AssignPlayersToTeams(cloneDeep(defaultStateData));
            expect(() => state.teamsComplete({user})).to.throw;
        });

        it("should throw when team 1 has no players yet", () => {
            const state = new AssignPlayersToTeams(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "playerId")
                )(defaultStateData)
            );

            expect(() => state.teamsComplete({user})).to.throw;
        });

        it("should throw when team 1 has no players yet", () => {
            const state = new AssignPlayersToTeams(
                flow(
                    cloneDeep,
                    set("teams[1][0]", "playerId")
                )(defaultStateData)
            );

            expect(() => state.teamsComplete({user})).to.throw;
        });

        it("should return the next state, which is ChooseInitiator", () => {
            const state = new AssignPlayersToTeams(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "playerId1"),
                    set("teams[1][0]", "playerId2")
                )(defaultStateData)
            );

            expect(state.teamsComplete({user})).to.have.property("name", "choose-initiator");
        });

        it("should pass current state data to next state", () => {
            const stateData = flow(
                cloneDeep,
                set("teams[0][0]", "playerId1"),
                set("teams[1][0]", "playerId2")
            )(defaultStateData);
            const state = new AssignPlayersToTeams(stateData);

            const nextState = state.teamsComplete({user});
            expect(nextState).to.have.property("data").to.eql(stateData);
        });
    });
});