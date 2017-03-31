const retry = require("async/retry");
const map = require("lodash/fp/map");
const moment = require("moment");
const GenericRepo = require("./generic-repo");
const MatchStateChange = require("../../models/match-state-change");

class MatchStateChangesRepo extends GenericRepo {
    constructor(options) {
        super(Object.assign({
            defaults: {
                time: () => moment().toISOString()
            },
            model: MatchStateChange
        }, options));
    }

    getByMatchId(matchId) {
        return new Promise((resolve, reject) => {
            retry(this.retries, (done) => {
                this.documentClient.query({
                    TableName: this.table,
                    KeyConditionExpression: "matchId = :matchId",
                    ExpressionAttributeValues: {
                        ":matchId": matchId
                    }
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(
                        map(item => new (this.modelClass)(item)
                    )(data.Items));
                }
            });
        });
    }
}

module.exports = MatchStateChangesRepo;