const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const SelectMap = require("./select-map");
const defaultStateData = require("./state-util").defaultStateData;

const user = {id: "test-user"};

describe("SelectMap", () => {

    describe("selectMap", () => {

        it("should set the map for the current round", () => {
            const state = new SelectMap(
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
            const state = new SelectMap(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            expect(() => state.selectMap({user: {id: "user1"}})).to.throw();
        });

        it("should return state 'select-faction'", () => {
            const state = new SelectMap(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            let nextState = state.selectMap({map: "map1", user: {id: "user2"}});
            expect(nextState).to.have.property("name", "select-faction");
        });
    });
});