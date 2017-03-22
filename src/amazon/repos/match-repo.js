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
                    reject(err);
                } else {
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
                    FilterExpression: "players CONTAINS :playerId",
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
}

module.exports = MatchRepo;