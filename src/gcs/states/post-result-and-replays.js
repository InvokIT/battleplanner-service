const isNumber = require("lodash/fp/isNumber");
const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const get = require("lodash/fp/get");
const flatten = require("lodash/fp/flatten");
const every = require("lodash/fp/every");
const isInteger = require("lodash/fp/isInteger");
const isString = require("lodash/fp/isString");
const log = require("../../log")(__filename);
const {setWinner, setReplayUploaded, nextRound} = require("./state-util");

function hasAllPlayersUploadedReplay(data) {
    const currentRound = data.currentRound;
    return flow(
        get("teams"),
        flatten,
        every(pId => {
            const replayProgress = get(`rounds[${currentRound}].replayUploaded[${pId}]`, data);
            return replayProgress === 1;
        })
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
    )(data);
}

const isValidTeam = (winnerTeam, data) => winnerTeam >= 0 && winnerTeam < data.teams.length;

const isValidVictoryPoints = (victoryPoints) => victoryPoints > 0 && victoryPoints <= 500;

class PostResultAndReplays {
    constructor(data) {
        this.data = data;
    }

    setResult({winnerTeam, winnerVictoryPoints, user}) {
        if (!isValidTeam(winnerTeam, this.data)) {
            log.error({winnerTeam, winnerVictoryPoints, user}, "Invalid winnerTeam value.");
            throw new Error("Invalid winnerTeam value");
        }

        if (!isValidVictoryPoints(winnerVictoryPoints)) {
            log.error({winnerTeam, winnerVictoryPoints, user}, "Invalid winnerVictoryPoints value.");
            throw new Error("Invalid winnerVictoryPoints value");
        }

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
        let nextStateName;
        let data = this.data;
        if (hasAllPlayersUploadedReplay(this.data) && hasWinnerBeenSet(this.data)) {
            data = nextRound(this.data);

            if (roundHasMap(data)) {
                nextStateName = "select-faction";
            } else {
                nextStateName = "select-map-or-faction";
            }
            // TODO What if there is no more rounds?

        } else {
            nextStateName = "post-result-and-replays";
        }

        return {
            name: nextStateName,
            data: cloneDeep(data)
        };
    }
}

module.exports = PostResultAndReplays;