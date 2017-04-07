const parallel = require("async/parallel");
const reduce = require("lodash/fp/reduce");
const _remove = require("lodash/remove");
const without = require("lodash/fp/without");
const isString = require("lodash/fp/isString");
const defaultTo = require("lodash/fp/defaultTo");
const cloneDeep = require("lodash/fp/cloneDeep");
const uniq = require("lodash/fp/uniq");
const log = require("../log")("controllers/match-lobby");
const matchStateChangeRepo = require("../repos/match-state-change");
const matchStateReducer = require("../gcs/match-state-reducer");
const MatchStateChange = require("../models/match-state-change");
const moment = require("moment");

class MatchLobby {
    constructor(matchId) {
        this.matchId = matchId;
        this.players = [];
        this.matchState = null;
    }

    userConnected(user, socket) {
        log.info({matchId: this.matchId, user}, "Player connected to match");

        const player = {user, socket};

        this.players.push(player);

        socket.addEventListener("message", (data, flags) => this.onMessageReceived(user, socket, data));
        socket.addEventListener("close", (e) => this.onUserDisconnected(user, socket, e.code, e.reason));
        socket.addEventListener("error", error => this.onError(user, socket, error));

        this._sendPlayerListToPlayers();

        this._getMatchState()
            .then(state => this._sendMatchStateToPlayer(state, player));
    }

    onUserDisconnected(user, socket, code, reason) {
        // Remove from this.players and log it
        _remove(this.players, p => p.user.id === user.id);
        log.info({player: user}, "Player disconnected");

        if (this.players.length === 0) {
            // Remove self from lobbies map
            log.debug({matchId: this.matchId}, "Removed lobby from cache.");
            lobbies.delete(this.matchId);
        }
    }

    onMessageReceived(user, socket, e) {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
            case "state-change":
                this.onStateChange(
                    user,
                    socket,
                    new MatchStateChange({
                        matchId: this.matchId,
                        time: moment().toISOString(),
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

    sendPing() {
        log.debug({matchId:this.matchId}, "Sending PING to players");
        this.players.forEach(player => {
            player.socket.send(JSON.stringify({
               type: "ping"
            }));
        })
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
        log.trace({matchState, user: player.user}, "Sending match state to user");

        return new Promise((resolve, reject) => {
            const msg = JSON.stringify({
                type: "match-state-update",
                matchId: this.matchId,
                state: matchState
            });

            player.socket.send(msg, (err) => {
                if (err) {
                    log.error(
                        {
                            error,
                            matchId: this.matchId,
                            user: player.user
                        },
                        "Error when sending state update to user."
                    );
                    reject(err);
                } else {
                    log.debug({user: player.user, matchId: this.matchId}, "Match state sent to user.");
                    resolve();
                }
            });
        }).catch(error => {
            log.error({error}, "Error sending match state to user");
        });
    }

    _sendPlayerListToPlayers() {
        const playerList = this.players.map(p => p.user.id);

        log.trace({playerList}, "Sending player list to users.");

        const msg = JSON.stringify({
            type: "players-update",
            matchId: this.matchId,
            players: playerList
        });

        return Promise.all(this.players.map(
            p => new Promise((resolve, reject) => {
                p.socket.send(
                    msg,
                    (err) => {
                        if (err) {
                            log.error({error: err, matchId: this.matchId, message: msg, user: p.user}, "Error sending player list to player");
                            reject(err);
                        } else {
                            log.debug({message: msg, user: p.user}, "Player list sent to user");
                            resolve();
                        }
                    });
            })
        )).catch(err => {
            log.error(err, "Error while sending player list to players.")
        });
    }
}

const lobbies = new Map();

// Ping all connected users every 10 seconds
setInterval(() => {
    lobbies.forEach(matchLobby => matchLobby.sendPing());
}, 10 * 1000);

module.exports = (matchId) => {
    if (lobbies.has(matchId)) {
        return lobbies.get(matchId);
    } else {
        const lobby = new MatchLobby(matchId);
        lobbies.set(matchId, lobby);
        return lobby;
    }
};