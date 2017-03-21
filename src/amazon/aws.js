const AWS = require("aws-sdk");

AWS.config.update({
    credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY),
    region: process.env.AWS_REGION
});

module.exports = AWS;