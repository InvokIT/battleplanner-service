const isNumber = require("lodash/fp/isNumber");
const flow = require("lodash/fp/flow");
const cloneDeep = require("lodash/fp/cloneDeep");
const get = require("lodash/fp/get");
const flatten = require("lodash/fp/flatten");
const every = require("lodash/fp/every");
const isInteger = require("lodash/fp/isInteger");
const isString = require("lodash/fp/isString");
const isNil = require("lodash/fp/isNil");
const max = require("lodash/fp/max");
const gt = require("lodash/fp/gt");
const reduce = require("lodash/fp/reduce");
const log = require("../../log")(__filename);
const {setWinner, setReplayUploaded, nextRound} = require("./state-util");

function hasAllPlayersUploadedReplay(data) {
    // TODO Remove below when replay uploading is implemented
    return true;

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

const isGameOver = (stateData) => {
    // The game is over when a team has won more than rounds.length / 2
    const winsRequired = Math.floor(stateData.rounds.length / 2) + 1;

    const r = flow(
        get("rounds"),
        reduce((wins, round) => {
            if (!isNil(round.winner)) {
                wins[round.winner] += 1;
            }

            return wins;
        }, [0, 0]),
        max,
        wins => wins >= winsRequired
    )(stateData);

    return r;
};

class PostResultAndReplays {
    constructor(data) {
        this.data = data;
    }

    setResult({winnerTeam, winnerVictoryPoints, userId}) {
        if (!isValidTeam(winnerTeam, this.data)) {
            log.error({winnerTeam, winnerVictoryPoints, userId}, "Invalid winnerTeam value.");
            throw new Error("Invalid winnerTeam value");
        }

        if (!isValidVictoryPoints(winnerVictoryPoints)) {
            log.error({winnerTeam, winnerVictoryPoints, userId}, "Invalid winnerVictoryPoints value.");
            throw new Error("Invalid winnerVictoryPoints value");
        }

        this.data = setWinner(winnerTeam, winnerVictoryPoints, this.data);
        const nextState = this.nextState();

        log.info({nextState, userId}, "User posted result");

        return nextState;
    }

    replayUploadedUpdate({userId, value}) {
        if (!isNumber(value) || value < 0 || value > 1) {
            log.error({userId, value}, "Invalid value for replay progress.");
            throw new Error("Invalid value for replay progress.");
        }

        this.data = setReplayUploaded(userId, value, this.data);

        const nextState = this.nextState();

        log.info({nextState, userId, value}, "User updated replay progress");

        return nextState;
    }

    nextState() {
        let nextStateName;
        let data = this.data;
        if (hasAllPlayersUploadedReplay(this.data) && hasWinnerBeenSet(this.data)) {
            if (isGameOver(this.data)) {
                nextStateName = "game-over";
                data = cloneDeep(data);
                data.currentRound = -1;
            } else {
                data = nextRound(this.data);

                if (roundHasMap(data)) {
                    nextStateName = "select-faction";
                } else {
                    nextStateName = "select-map-or-faction";
                }
            }
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