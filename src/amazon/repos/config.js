const AWS = require("../aws");

const documentClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

module.exports = {
    user: new (require("./user-repo"))({
        documentClient,
        table: process.env.AWS_DYNAMODB_TABLE_USER,
        steamIdIndex: process.env.AWS_DYNAMODB_TABLE_USER_STEAMIDINDEX
    }),
    replay: new (require("./replay-repo"))({
        s3,
        bucket: process.env.AWS_S3_BUCKET_REPLAYS
    }),
    match: new (require("./match-repo"))({
        documentClient,
        table: process.env.AWS_DYNAMODB_TABLE_MATCH,
        historyTable: process.env.AWS_DYNAMODB_TABLE_MATCHHISTORY
    }),
    matchStateChange: new (require("./match-state-change-repo"))({
        documentClient,
        table: process.env.AWS_DYNAMODB_TABLE_MATCHSTATECHANGE
    })
};