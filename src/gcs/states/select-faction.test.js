const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const SelectFaction = require("./select-faction");
const defaultStateData = require("./state-util").defaultStateData;

const user = {id: "test-user"};

describe("SelectFaction", () => {

    describe("selectFaction", () => {

        it("should set the faction for player in current round", () => {
            const state = new SelectFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("currentRound", 1)
                )(defaultStateData)
            );

            expect(state).to.not.have.deep.property("data.rounds[1].factions.user1");

            const nextState = state.selectFaction({faction: "f1", user: {id: "user1"}});
            expect(nextState).to.have.deep.property("data.rounds[1].factions.user1", "f1");
        });

        it("should throw on missing faction param", () => {
            const state = new SelectFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            expect(() => state.selectFaction({user: {id: "user1"}})).to.throw();
        });

        it("should return same state when not all players has chosen factions yet", () => {
            const state = new SelectFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            const nextState = state.selectFaction({faction: "f1", user: {id: "user1"}});
            expect(nextState).to.have.property("name", "select-faction");
        });

        it("should return state 'play-game' when all players has chosen factions", () => {
            const state = new SelectFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("rounds[0]factions[user1]", "f1")
                )(defaultStateData)
            );

            let nextState = state.selectFaction({faction: "f2", user: {id: "user2"}});
            expect(nextState).to.have.property("name", "play-game");
        });
    });
});