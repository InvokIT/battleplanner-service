const cloneDeep = require("lodash/fp/cloneDeep");
const flow = require("lodash/fp/flow");
const isNil = require("lodash/fp/isNil");
const log = require("../../log")(__filename);
const PlayGame = require("./play-game");
const {nextTeam, setFaction} = require("./state-util");

const hasAllPlayersChosenFaction = (stateData) => {
    return stateData.get("teams").every(t => t.every(p => !isNil(p.faction)));
};

class SelectFaction {
    constructor(data) {
        this.data = data;
    }

    selectFaction({faction, user}) {
        // const newStateData = flow(
        //     cloneDeep,
        //     setFaction(user.id, faction), nextTeam
        // )(this.data);
        //
        // let nextState;
        //
        // if (hasAllPlayersChosenFaction(newStateData)) {
        //     nextState = new PlayGame(newStateData);
        // } else {
        //     nextState = new SelectFaction(newStateData);
        // }
        //
        // log.info({nextState, user}, "User selected faction");
        //
        // return nextState;
    }
}

module.exports = SelectFaction;