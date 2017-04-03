const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const PostResultAndReplays = require("./post-result-and-replays");
const defaultStateData = require("./state-util").defaultStateData;

const user = {id: "test-user"};

describe("PostResultAndReplays", () => {

    describe("setResult", () => {

        it("should set the round winner team and victory points", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("currentRound", 1)
                )(defaultStateData)
            );

            expect(state.data).to.have.deep.property("rounds[1].winner").to.not.exist;
            expect(state.data).to.have.deep.property("rounds[1].winnerVictoryPoints").to.not.exist;

            const nextState = state.setResult({winnerTeam: 1, winnerVictoryPoints: 400, user});
            expect(nextState).to.have.deep.property("data.rounds[1].winner", 1);
            expect(nextState).to.have.deep.property("data.rounds[1].winnerVictoryPoints", 400);
        });

        it("should throw on missing winnerTeam param", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep
                )(defaultStateData)
            );

            expect(() => state.setResult({winnerTeam: undefined, winnerVictoryPoints: 200, user})).to.throw();
        });

        it("should throw on missing winnerVictoryPoints param", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep
                )(defaultStateData)
            );

            expect(() => state.setResult({winnerTeam: 1, winnerVictoryPoints: undefined, user})).to.throw();
        });

        it("should throw on negative winnerVictoryPoints param", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep
                )(defaultStateData)
            );

            expect(() => state.setResult({winnerTeam: 1, winnerVictoryPoints: -1, user})).to.throw();
        });

        it("should throw on winnerVictoryPoints=0 param", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep
                )(defaultStateData)
            );

            expect(() => state.setResult({winnerTeam: 1, winnerVictoryPoints: 0, user})).to.throw();
        });

        it("should throw on winnerTeam out-of-bounds param", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep
                )(defaultStateData)
            );

            expect(() => state.setResult({winnerTeam: 2, winnerVictoryPoints: 100, user})).to.throw();
        });

        it("should throw on negative winnerTeam param", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep
                )(defaultStateData)
            );

            expect(() => state.setResult({winnerTeam: -1, winnerVictoryPoints: 100, user})).to.throw();
        });

        it("should return same state when replays has still not begun uploading", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            const nextState = state.setResult({winnerTeam: 1, winnerVictoryPoints: 400, user});
            expect(nextState).to.have.property("name", "post-result-and-replays");
        });

        it("should return same state when replays has only begun uploading", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("rounds[0].replayUploaded.user1", 0.5),
                    set("rounds[0].replayUploaded.user2", 1)
                )(defaultStateData)
            );

            const nextState = state.setResult({winnerTeam: 1, winnerVictoryPoints: 400, user});
            expect(nextState).to.have.property("name", "post-result-and-replays");
        });

        it("should return state 'select-map-or-faction' when replays has uploaded", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2"),
                    set("rounds[0].replayUploaded.user1", 1),
                    set("rounds[0].replayUploaded.user2", 1)
                )(defaultStateData)
            );

            const nextState = state.setResult({winnerTeam: 1, winnerVictoryPoints: 400, user});
            expect(nextState).to.have.property("name", "select-map-or-faction");
        });
    });

    describe("replayUploadedUpdate", () => {

        it("should update the replay status for the current round", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("currentRound", 2),
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );

            const nextState = state.replayUploadedUpdate({user:{id:"user1"}, value: 0.5});
            expect(nextState).to.have.deep.property("data.rounds[2].replayUploaded.user1", 0.5);
        });

        it("should throw on negative value", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );


            expect(() => state.replayUploadedUpdate({user:{id:"user1"}, value: -0.1})).to.throw();
        });

        it("should throw on missing user", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );


            expect(() => state.replayUploadedUpdate({value: 1})).to.throw();
        });

        it("should throw on value > 1", () => {
            const state = new PostResultAndReplays(
                flow(
                    cloneDeep,
                    set("teams[0][0]", "user1"),
                    set("teams[1][0]", "user2")
                )(defaultStateData)
            );


            expect(() => state.replayUploadedUpdate({user:{id:"user1"}, value: 1+Number.EPSILON})).to.throw();
        });

    });
});