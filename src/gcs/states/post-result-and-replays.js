const isNumber = require("lodash/fp/isNumber");
const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const get = require("lodash/fp/get");
const flatten = require("lodash/fp/flatten");
const every = require("lodash/fp/every");
const isInteger = require("lodash/fp/isInteger");
const isString = require("lodash/fp/isString");
const log = require("../../log")(__filename);
const SelectMapOrFaction = require("./select-map-or-faction");
const SelectFaction = require("./select-faction");
const {setWinner, setReplayUploaded, nextRound} = require("./state-util");


console.log("SelectMapOrFaction = " + typeof SelectMapOrFaction);

function hasAllPlayersUploadedReplay(data) {
    const currentRound = data.currentRound;
    return flow(
        get("teams"),
        flatten,
        every(pId => get(`rounds[${currentRound}].replays[${pId}]`, data) === 1)
    )(data);
}

function hasWinnerBeenSet(data) {
    const currentRound = data.currentRound;
    return flow(
        get(`rounds[${currentRound}].winner`),
        isInteger
    )(data);
}

function roundHasMap(data) {
    const currentRound = data.currentRound;
    return flow(
        get(`rounds[${currentRound}].map`),
        isString
    ) (data);
}

class PostResultAndReplays {
    constructor(data) {
        this.data = data;
    }

    setResult({winnerTeam, winnerVictoryPoints, user}) {
        this.data = setWinner(winnerTeam, winnerVictoryPoints, this.data);
        const nextState = this.nextState();

        log.info({nextState, user}, "User posted result");

        return nextState;
    }

    replayUploadedUpdate({user, value}) {
        if (!isNumber(value) || value < 0 || value > 1) {
            log.error({user, value}, "Invalid value for replay progress.");
            throw new Error("Invalid value for replay progress.");
        }

        this.data = setReplayUploaded(user.id, value, this.data);

        const nextState = this.nextState();

        log.info({nextState, user, value}, "User updated replay progress");

        return nextState;
    }

    nextState() {
        if (hasAllPlayersUploadedReplay(this.data) && hasWinnerBeenSet(this.data)) {
            const data = nextRound(this.data);
            if (roundHasMap(data)) {
                return new SelectFaction(cloneDeep(data));
            } else {
                return new SelectMapOrFaction(cloneDeep(data));
            }
            // TODO What if there is no more rounds?
        } else {
            return this;
        }
    }
}

module.exports = PostResultAndReplays;