const AWS = require("./aws");

const files = new Map();
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
                reject(err);
            } else {
                const body = data.Body;
                files.set(filename, body);

                resolve(body);
            }
        });
    });
};

Promise.all([
    getFile(PRIVATE_KEY),
    getFile(PUBLIC_KEY)
]).then(() => {}, (err) => {});

module.exports = {
    get privateKey() {
        return files.get(PRIVATE_KEY);
    },

    get publicKey() {
        return files.get(PUBLIC_KEY);
    }
};