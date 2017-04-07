const cloneDeep = require("lodash/fp/cloneDeep");
const isNumber = require("lodash/fp/isNumber");
const flow = require("lodash/fp/flow");
const isNil = require("lodash/fp/isNil");
const log = require("../../log")(__filename);
const {setInitiator, setCurrentTeam} = require("./state-util");

class ChooseInitiator {
    constructor(data) {
        this.data = data;
    }

    chooseInitiator({team, user}) {
        log.trace({this: this, team, user}, "chooseInitiator");

        if (!isNumber(team)) {
            log.error({team}, "team is not a number");
            throw Error("team is not a number");
        }

        const nextState = {
            name: "choose-initiator",
            data: flow(
                cloneDeep,
                setInitiator(team)
            )(this.data)
        };

        log.info({team, user, nextState}, "User chose initiating team.");

        return nextState;
    }

    flipCoin({user}) {
        log.trace({this: this, user}, "flipCoin");

        const randomTeam = Math.floor(Math.random() * this.data.teams.length);
        return this.chooseInitiator({team: randomTeam, user: user});
    }

    continue({user}) {
        log.trace({user}, "continue");

        if (isNil(this.data.initiator)) {
            throw new Error("Cannot continue without an initator set.");
        }

        const nextState =  {
            name: "select-map-or-faction",
            data: flow(
                cloneDeep,
                setCurrentTeam(this.data.initiator)
            )(this.data)
        };

        return nextState;
    }
}

module.exports = ChooseInitiator;