const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const createRoundsStateData = require("./state-util").createRoundsStateData;

class ApplyMatchOptions {
    constructor(data) {
        this.data = data;
    }

    applyRoundCount({roundCount}) {
        const rounds = createRoundsStateData(roundCount);

        const nextState = {
            name: "apply-match-options",
            data: flow(
                cloneDeep,
                set("rounds", rounds)
            )(this.data)
        };

        return nextState;
    }

    continue() {
        return {
            name: "assign-players-to-teams",
            data: this.data
        };
    }
}

module.exports = ApplyMatchOptions;