const parallel = require("async/parallel");
const reduce = require("lodash/fp/reduce");
const remove = require("lodash/fp/remove");
const isString = require("lodash/fp/isString");
const defaultTo = require("lodash/fp/defaultTo");
const cloneDeep = require("lodash/fp/cloneDeep");
const log = require("../log")("controllers/match-lobby");
const matchStateChangeRepo = require("../repos/match-state-change");
const matchStateReducer = require("../gcs/match-state-reducer");
const MatchStateChange = require("../models/match-state-change");

class MatchLobby {
    constructor(matchId) {
        this.matchId = matchId;
        this.players = [];
        this.matchState = null;
    }

    playerConnected(user, socket) {
        const player = {user, socket};

        this.players.push(player);

        socket.addEventListener("message", (data, flags) => this.onMessageReceived(user, socket, data));
        socket.addEventListener("close", (code, reason) => this.onPlayerDisconnected(user, socket, code, reason));
        socket.addEventListener("error", error => this.onError(user, socket, error));

        this._sendPlayerListToPlayers();

        this._getMatchState()
            .then(state => this._sendMatchStateToPlayer(state, player));
    }

    onPlayerDisconnected(user, socket, code, reason) {
        // Remove from this.players and log it
        remove(p => p.user.id === user.id, this.players);
        log.info({player: user, code, reason}, "Player disconnected");
    }

    onMessageReceived(user, socket, data) {
        const msg = JSON.parse(data);
        switch (msg.type) {
            case "state-change":
                this.onStateChange(
                    user,
                    socket,
                    new MatchStateChange({
                        name: msg.name,
                        params: defaultTo({}, msg.params)
                    })
                );
                break;
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
        // Save changes to match-state table
        return Promise.all([
            matchStateChangeRepo.save(stateChange),
            this._getMatchState()
        ]).then(([, state]) => {
            stateChange.params.user = user;

            log.debug({stateChange}, "Received state-change");

            const newState = matchStateReducer([stateChange], state);
            this._setMatchState(newState);

            // TODO Save teams to match table
            //matchRepo.updateTeamsInMatch()
            // TODO Add to results match property in table
            //matchRepo.updateMatchResult

            return this._sendMatchStateToPlayers(newState);
        });

    }

    _getMatchState() {
        if (!this.matchState) {
            // get match state changes, reduce them to a state, store that in this.matchState, and return it
            this.matchState = matchStateChangeRepo.getByMatchId(this.matchId)
                .then(stateChanges => matchStateReducer(stateChanges))
        }

        return this.matchState;
    }

    _setMatchState(state) {
        this.matchState = Promise.resolve(state);
    }

    _sendMatchStateToPlayers(matchState) {
        return Promise.all(this.players.map(
            p => this._sendMatchStateToPlayer(matchState, p)
        ));
    }

    _sendMatchStateToPlayer(matchState, player) {
        return new Promise((resolve, reject) => {
            const msg = JSON.stringify({
                type: "match-state-update",
                matchId: this.matchId,
                state: matchState
            });

            p.socket.send(msg, (err) => {
                if (err) {
                    log.error(
                        {
                            error,
                            matchId: this.matchId,
                            user: player.user,
                            data: msg
                        },
                        "Error when sending state update to user."
                    );

                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    _sendPlayerListToPlayers() {
        const playerList = this.players.map(p => p.user.id);

        return Promise.all(this.players.map(
            p => new Promise((resolve, reject) => {
                p.socket.send(
                    {
                        type: "players-update",
                        matchId: this.matchId,
                        players: playerList
                    },
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
            })
        ));
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