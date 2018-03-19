const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const set = require("lodash/fp/set");
const createRoundsStateData = require("./state-util").createRoundsStateData;

class ApplyMatchOptions {
    constructor(data) {
        this.data = data;
    }

    applyMatchOptions({playerCount, roundCount}) {
        const rounds = createRoundsStateData(roundCount);

        if (!/\dv\d/.test(playerCount)) {
            throw new Error(`Invalid playerCount value: ${playerCount}`);
        }

        const teams = playerCount.split("v")
            .map(count => parseInt(count, 10))
            .map(count => new Array(count));

        const nextState = {
            name: "apply-match-options",
            data: flow(
                cloneDeep,
                set("rounds", rounds),
                set("teams", teams)
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