const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const SelectMapOrFaction = require("./select-map-or-faction");
const defaultStateData = require("./state-util").defaultStateData;

const user = {id: "test-user"};

describe("SelectMapOrFaction", () => {

    describe("selectMap", () => {

        it("should set the map for the current round", () => {
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("currentRound", 1)
                )(defaultStateData)
            );

            expect(state).to.have.deep.property("data.rounds[1].map").to.not.exist;

            const nextState = state.selectMap({map: "mapname", user: {id: "user1"}});
            expect(nextState).to.have.deep.property("data.rounds[1].map", "mapname");
        });

        it("should throw on missing map param", () => {
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            expect(() => state.selectMap({user: {id: "user1"}})).to.throw();
        });

        it("should return state 'select-faction'", () => {
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            let nextState = state.selectMap({map: "map1", user: {id: "user2"}});
            expect(nextState).to.have.property("name", "select-faction");
        });

        it("should pass the turn to the next team", () => {
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("currentTeam", 0)
                )(defaultStateData)
            );

            let nextState = state.selectMap({map: "map1", user: {id: "user1"}});
            expect(nextState).to.have.deep.property("data.currentTeam", 1);
        });
    });

    describe("selectFaction", () => {

        it("should set the faction for player in current round", () => {
            const state = new SelectMapOrFaction(
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
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            expect(() => state.selectFaction({user: {id: "user1"}})).to.throw();
        });

        it("should return state 'select-map' for the other team", () => {
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("currentTeam", 1)
                )(defaultStateData)
            );

            let nextState = state.selectFaction({faction: "f1", user: {id: "user2"}});
            expect(nextState).to.have.property("name", "select-map");
            expect(nextState).to.have.deep.property("data.currentTeam", 0);
        });

        it("in 2v2, should return state select faction for the next player on the team", () => {
            const state = new SelectMapOrFaction(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[0][1]", "user2"),
                    set("teams[1][0]", "user3"),
                    set("teams[1][1]", "user4"),
                    set("currentTeam", 1)
                )(defaultStateData)
            );

            let nextState = state.selectFaction({faction: "f1", user: {id: "user1"}});
            expect(nextState).to.have.property("name", "select-faction");
            expect(nextState).to.have.deep.property("data.currentTeam", 1);

            let nextState2 = nextState.selectFaction({faction: "f1", user: {id: "user2"}});
            expect(nextState2).to.have.property("name", "select-map");
            expect(nextState2).to.have.deep.property("data.currentTeam", 0);
        });
    });

});