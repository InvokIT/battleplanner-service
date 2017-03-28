const parallel = require("async/parallel");
const reduce = require("lodash/fp/reduce");
const remove = require("lodash/fp/remove");
const isString = require("lodash/fp/isString");
const defaultTo = require("lodash/fp/defaultTo");
const log = require("../log")("controllers/match-lobby");
const matches = require("../repos/match");
const matchStateReducer = require("../gcs/match-state-reducer");

class MatchLobby {
    constructor(matchId) {
        this.matchId = matchId;
        this.players = [];
    }

    playerConnected(user, socket) {
        this.players.push({user, socket});
        socket.addEventListener("message", (data, flags) => this.onMessageReceived(user, socket, data));
        socket.addEventListener("close", (code, reason) => this.onPlayerDisconnected(user, socket, code, reason));
        socket.addEventListener("error", error => this.onError(user, socket, error));
    }

    onPlayerDisconnected(user, socket, code, reason) {
        // Remove from this.players and log it
        remove(p => p.user.id === user.id, this.players);
        log.info({player: user}, "Player disconnected");
    }

    onMessageReceived(user, socket, data) {
        const msg = JSON.parse(data);
        switch (msg.type) {
            case "state-change":
                this.onStateChange(user, socket, {
                    name: msg.name,
                    params: defaultTo({}, msg.params)
                });
            default:
                log.warn({data}, "Unknown data received");
        }
    }

    onError(user, socket, error) {
        // Remove from this.players and log it
        remove(p => p.user.id === user.id, this.players);
        log.warn({player: user, error}, "Socket error");
    }

    onStateChange(user, socket, stateChange) {
        if (!isString(stateChange.name)) {
            log.error("stateChange.name not defined");
            throw new Error("stateChange.name not defined");
        }

        stateChange.params.user = user;

        log.debug({stateChange}, "Received state-change");

        return matches.get({id: this.matchId})
            .then(match => {
                const stateChanges = match.stateChanges || (match.stateChanges = []);
                stateChanges.push(stateChange);
                match.stateChanges = stateChanges;

                try {
                    const currentState = matchStateReducer(stateChanges);
                    log.info({stateChanges, data}, "Reduced stateChanges to state.");

                    return {match, currentState};
                } catch (err) {
                    log.error({
                        error,
                        matchId: this.matchId,
                        stateChanges
                    }, "Error when applying state-change. State-change ignored.");
                    throw err;
                }
            })
            .then(({match, currentState}) => {
                matches.save(match);
                return currentState;
            })
            .then(currentState => {
                log.info({
                    matchId: this.matchId,
                    data: currentState
                }, "Sending state update for match to players.");

                parallel(this.players.map(p => (done) => p.socket.send(
                    JSON.stringify({
                        type: "state-update",
                        matchId: this.matchId,
                        data: currentState
                    }),
                    done)
                ), (error) => {
                    if (error) {
                        log.error({
                            error,
                            matchId: this.matchId,
                            data: currentState
                        }, "Error when sending state update to players.")
                    }
                });
            });
    }
}

const lobbies = new Map();

module.exports = (matchId) => {
    if (lobbies.has(matchId)) {
        return lobbies.get(matchId);
    } else {
        const lobby = new MatchLobby(matchId);
        lobbies.set(matchId, lobby);
        return lobby;
    }
};