const log = require("bunyan").createLogger({name: "amazon/boot"});
const AWS = require("./aws");

const PRIVATE_KEY = "private_key.pem";
const PUBLIC_KEY = "public_key.pem";

const getFile = (filename) => {
    return new Promise((resolve, reject) => {
        const s3 = new AWS.S3();
        s3.getObject({
            Bucket: process.env.AWS_S3_BUCKET_ETC,
            Key: filename
        }, (err, data) => {
            if (err) {
                log.warn(err);
                reject(err);
            } else {
                log.info({filename}, "Fetched file from S3.");
                const body = data.Body;

                resolve(body);
            }
        });
    });
};


module.exports = {
    getPrivateKey() {
        return getFile(PRIVATE_KEY);
    },

    getPublicKey() {
        return getFile(PUBLIC_KEY);
    }
};