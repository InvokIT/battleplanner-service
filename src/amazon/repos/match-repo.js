const retryable = require("async/retryable");
const retry = require("async/retry");
const series = require("async/series");
const isNil = require("lodash/isNil");
const isString = require("lodash/isString");
const head = require("lodash/fp/head");
const values = require("lodash/fp/values");
const flatten = require("lodash/fp/flatten");
const flow = require("lodash/fp/flow");
const pick = require("lodash/fp/pick");
const moment = require("moment");
const GenericRepo = require("./generic-repo");
const Match = require("../../models/match");
const log = require("../../log")("amazon/repos/match-repo");

class MatchRepo extends GenericRepo {
    constructor(options) {
        super(Object.assign({
            defaults: {
                created: () => moment().toISOString(),
                active: true
            },
            model: Match
        }, options));

        this.historyTable = options.historyTable;

        if (!isString(this.historyTable)) {
            throw new Error("historyTable is not a string");
        }
    }

    get(key) {
        return new Promise((resolve, reject) => {
            if (isNil(key)) {
                throw new Error("id is nil");
            }

            retry(this.retries, (done) => {
                this.documentClient.batchGet({
                    RequestItems: {
                        [this.table]: {
                            Keys: [key]
                        },
                        [this.historyTable]: {
                            Keys: [key]
                        }
                    }
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const item = flow(values, flatten, head)(data.Responses);
                    resolve(item ? new (this.modelClass)(item) : null);
                }
            });
        });
    }

    save(match) {
        return new Promise((resolve, reject) => {
            if (isNil(match)) {
                throw new Error("model is nil.");
            }

            this.assignDefaults(match);

            // If match is not active then save it to history table
            const put = retryable(this.retries, (done) => {
                this.documentClient.put({
                    TableName: match.active ? this.table : this.historyTable,
                    Item: match
                }, done);
            });

            // Delete the match from the active or history table
            const remove = retryable(this.retries, (done) => {
                this.documentClient.delete({
                    TableName: match.active ? this.historyTable : this.table,
                    Key: pick("id", match)
                }, done);
            });

            series([put, remove], (err) => {
                if (err) {
                    log.error(err);
                    reject(err);
                } else {
                    log.debug({match}, "Saved match");
                    resolve(match);
                }
            });
        });
    }

    getActive() {
        return new Promise((resolve, reject) => {
            retry(this.retries, (done) => {
                this.documentClient.scan({
                    TableName: this.table
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Items.map(m => new (this.modelClass)(m)));
                }
            });
        });
    }

    getActiveByPlayerId(playerId) {
        return new Promise((resolve, reject) => {
            retry(this.retries, (done) => {
                this.documentClient.scan({
                    TableName: this.table,
                    FilterExpression: "#owner = :playerId OR contains(players, :playerId)",
                    ExpressionAttributeNames: {
                        "#owner": "owner"
                    },
                    ExpressionAttributeValues: {
                        ":playerId": playerId
                    }
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Items.map(m => new (this.modelClass)(m)));
                }
            });
        });
    }

    updateMatchSummary(matchId, summary) {
        return new Promise((resolve, reject) => {
            log.trace({matchId, summary}, "updateMatchSummary");

            retry(this.retries, (done) => {
                this.documentClient.update({
                    TableName: this.table,
                    Key: {id: matchId},
                    UpdateExpression: `set summary = :summary`,
                    ExpressionAttributeValues: {
                        ":summary": summary
                    }
                }, done);
            }, (err, data) => {
                if (err) {
                    log.error({matchId, summary: summary, error: err}, "Updating summary.");
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    updateMatchTeams(matchId, teams) {
        return new Promise((resolve, reject) => {
            retry(this.retries, (done) => {
                this.documentClient.update({
                    TableName: this.table,
                    Key: {id: matchId},
                    UpdateExpression: `set teams = :teams`,
                    ExpressionAttributeValues: {
                        ":teams": teams
                    }
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    updateMatchResults(matchId, results) {
        return new Promise((resolve, reject) => {
            retry(this.retries, (done) => {
                this.documentClient.update({
                    TableName: this.table,
                    Key: {id: matchId},
                    UpdateExpression: `set results = :results`,
                    ExpressionAttributeValues: {
                        ":results": results
                    }
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = MatchRepo;