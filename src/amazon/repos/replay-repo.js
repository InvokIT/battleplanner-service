const _isString = require("lodash/isString");
const _isNil = require("lodash/isNil");

const filenameFromReplay = (replay) => `${replay.matchId}_round-${replay.round}_${replay.playerId}.rec`;

class ReplayRepo {
    constructor({s3, bucket}) {
        this.s3 = s3;
        this.bucket = bucket;

        if (_isNil(this.s3)) {
            throw new Error("s3 is nil");
        }

        if (!_isString(this.bucket)) {
            throw new Error("bucket is not a string");
        }
    }

    save(replay) {
        return new Promise((resolve, reject) => {
            this.s3.putObject({
                Bucket: this.bucket,
                Key: filenameFromReplay(replay),
                body: replay.stream,
                ContentLength: replay.size,
                ContentType: "application/octet-stream",
                Metadata: { // TODO
                    // Title: replay.title,
                    // Players: replay.players,
                    // Map: replay.map
                }
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(replay);
                }
            });
        });
    }
}

module.exports = ReplayRepo;