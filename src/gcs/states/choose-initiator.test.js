const flow = require("lodash/fp/flow");
const set = require("lodash/fp/set");
const cloneDeep = require("lodash/fp/cloneDeep");
const defaultStateData = require("./state-util").defaultStateData;
const ChooseInitiator = require("./choose-initiator");

const user = {id: "test-user"};

describe("ChooseInitiator", () => {

    let state;

    beforeEach(() => {
        state = new ChooseInitiator(flow(
            cloneDeep,
            set("teams[0][0]", "playerId1"),
            set("teams[1][0]", "playerId2")
        )(defaultStateData));
    });

    describe("chooseInitiator", () => {

        it("should set the initiator on state data", () => {
            const nextState = state.chooseInitiator({team: 1, user});
            return expect(nextState.data).to.have.property("initiator", 1);
        });


        it("should set the current team to be the initiator", () => {
            const nextState = state.chooseInitiator({team: 1, user});
            return expect(nextState.data).to.have.property("currentTeam", 1);
        });

        it("should set the current team to be the initiator", () => {
            const nextState = state.chooseInitiator({team: 0, user});
            return expect(nextState.data).to.have.property("currentTeam", 0);
        });

        it("should throw when the team parameter is undefined", () => {
            return expect(() => state.chooseInitiator({user})).to.throw();
        });

        it("should throw when the team parameter is not a number", () => {
            return expect(() => state.chooseInitiator({team: "0", user})).to.throw();
        });

        it("should return the next state, SelectMapOrFaction", () => {
            return expect(state.chooseInitiator({team: 0, user})).to.have.property("name", "select-map-or-faction");
        });

    });
});