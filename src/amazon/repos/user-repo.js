const retry = require("async/retry");
const _isString = require("lodash/isString");
const _head = require("lodash/head");
const moment = require("moment");
const GenericRepo = require("./generic-repo");
const User = require("../../models/user");

class UserRepo extends GenericRepo {
    constructor(options) {
        super(Object.assign({
            defaults: {
                created: () => moment().toISOString()
            },
            model: User
        }, options));

        this.steamIdIndex = options.steamIdIndex;

        if (!_isString(this.steamIdIndex)) {
            throw new Error("steamIdIndex is not a string");
        }
    }

    getBySteamId(steamId) {
        return new Promise((resolve, reject) => {
            retry(this.retries, (done) => {
                this.documentClient.query({
                    TableName: this.table,
                    IndexName: this.steamIdIndex,
                    KeyConditionExpression: "steamId = :steamId",
                    ExpressionAttributeValues: {
                        ":steamId": steamId
                    },
                    Limit: 1
                }, done);
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new (this.modelClass)(_head(data.Items)));
                }
            });
        });
    }
}

module.exports = UserRepo;