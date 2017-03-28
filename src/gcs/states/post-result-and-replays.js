const isNumber = require("lodash/fp/isNumber");
const flow = require("lodash/fp/flow");
const log = require("../../log")(__filename);
const SelectMapOrFaction = require("./select-map-or-faction");
const SelectFaction = require("./select-faction");
const {setWinner, setReplayUploaded, nextRound} = require("./state-util");

function hasAllPlayersUploadedReplay(data) {
    const currentRound = data.get("currentRound");
    return data.get("teams").flatten().every(
        pId => data.getIn(["rounds", currentRound, "replays", pId]) === 1
    );
}

function hasWinnerBeenSet(data) {
    const currentRound = data.get("currentRound");
    return data.getIn(["rounds", currentRound])
}

function roundHasMap(data) {
    const currentRound = data.get("currentRound");
    return data.getIn(["rounds", currentRound, "map"]) !== null;
}

class PostResultAndReplays {
    constructor(data) {
        this.data = data;
    }

    setResult({winnerTeam, winnerVictoryPoints, user}) {
        this.data = setWinner(winnerTeam, winnerVictoryPoints, this.data);
        const nextState = this.nextState();

        log.info({nextState, user}, "User posted result");

        return this.nextState();
    }

    replayUploadedUpdate({user, value}) {
        if (!isNumber(value) || value < 0 || value > 1) {
            log.error({user, value}, "Invalid value for replay progress.");
            throw new Error("Invalid value for replay progress.");
        }

        this.data = setReplayUploaded(user.id, value, this.data);

        const nextState = this.nextState();

        log.info({nextState, user, value}, "User updated replay progress");

        return this.nextState();
    }

    nextState() {
        if (hasAllPlayersUploadedReplay(this.data) && hasWinnerBeenSet(this.data)) {
            const data = nextRound(this.data);
            if (roundHasMap(data)) {
                return new SelectFaction(data);
            } else {
                return new SelectMapOrFaction(data);
            }
            // TODO What if there is no more rounds?
        } else {
            return this;
        }
    }
}

module.exports = PostResultAndReplays;