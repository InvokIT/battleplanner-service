var gcloud = require('google-cloud');

const projectId = process.env.PROJECT_ID;
const bucketName = process.env.REPLAY_BUCKET_NAME;

const gcs = gcloud.storage({
    projectId: projectId
});

const bucket = gcs.bucket(bucketName);

const filenameFromReplay = (replay) => `${replay.matchId}-${replay.round}-${replay.playerId}.rec`;

module.exports = {
    save(replay) {
        return new Promise((resolve, reject) => {
            const file = bucket.file(filenameFromReplay(replay));
            const readStream = replay.stream;
            const writeStream = file.createWriteStream({
                contentType: "application/octet-stream",
                resumable: false,
                metadata: {

                }
            });

            readStream.pipe(writeStream)
                .on("error", reject)
                .on("finish", resolve);
        });
    }
};