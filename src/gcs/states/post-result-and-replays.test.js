const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const PostResultAndReplays = require("./post-result-and-replays");
const defaultStateData = require("./state-util").defaultStateData;
const SelectFaction = require("./select-faction");
const SelectMapOrFaction = require("./select-map-or-faction");

const user = {id: "test-user"};

describe("PostResultAndReplays", () => {

    describe("setResult", () => {

        it("should set the round winner team", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("currentRound", 1)
                )(defaultStateData));

            expect(state.data).to.have.deep.property("rounds[1].winner").to.not.exist;
            expect(state.data).to.have.deep.property("rounds[1].winnerVictoryPoints").to.not.exist;

            const nextState = state.setResult({winnerTeam: 1, winnerVictoryPoints: 400, user});
            expect(nextState).to.have.deep.property("data.rounds[1].winner", 1);
            expect(nextState).to.have.deep.property("data.rounds[1].winnerVictoryPoints", 400);
        });

    });
});