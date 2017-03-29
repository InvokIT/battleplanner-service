const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const PostResultAndReplays = require("./post-result-and-replays");
const defaultStateData = require("./state-util").defaultStateData;
const PlayGame = require("./play-game");

const user = {id: "test-user"};

describe("PlayGame", () => {

    let state;

    beforeEach(() => {
        state = new PlayGame(cloneDeep(defaultStateData));
    });

    describe("gamePlayed", () => {

        it("should return the next state, PostResultAndReplays", () => {
            expect(state.gamePlayed({user})).to.be.an.instanceof(PostResultAndReplays);
        });

    });
});