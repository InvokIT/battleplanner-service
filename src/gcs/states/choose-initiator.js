const cloneDeep = require("lodash/fp/cloneDeep");
const isNumber = require("lodash/fp/isNumber");
const flow = require("lodash/fp/flow");
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
            name: "select-map-or-faction",
            data: flow(
                cloneDeep,
                setInitiator(team),
                setCurrentTeam(team)
            )(this.data)
        };

        log.info({team, user, nextState}, "User chose initiating team.");

        return nextState;
    }
}

module.exports = ChooseInitiator;