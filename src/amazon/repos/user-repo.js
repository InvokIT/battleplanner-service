const _isString = require("lodash/isString");
const _head = require("lodash/head");
const moment = require("moment");
const GenericRepo = require("./generic-repo");

class UserRepo extends GenericRepo {
    constructor(options) {
        super(Object.assign({
            defaults: {
                created: () => moment().toISOString()
            }
        }, options));

        this.steamIdIndex = options.steamIdIndex;

        if (!_isString(this.steamIdIndex)) {
            throw new Error("steamIdIndex is not a string");
        }
    }

    getBySteamId(steamId) {
        return new Promise((resolve, reject) => {
            this.documentClient.query({
                TableName: this.table,
                IndexName: this.steamIdIndex,
                KeyConditionExpression: "steamId = :steamId",
                ExpressionAttributeValues: {
                    ":steamId": steamId
                },
                Limit: 1
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(_head(data.Items));
                }
            });
        });
    }
}

module.exports = UserRepo;