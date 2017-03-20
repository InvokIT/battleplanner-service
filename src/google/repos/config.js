const GenericRepo = require("./generic-repo");
var gcloud = require('google-cloud');

const projectId = process.env.PROJECT_ID;

const datastore = gcloud.datastore({
    projectId: projectId
});

module.exports = {
    user: new (require("./user-repo"))({datastore}),
    match: new GenericRepo(
        {
            kind: "match",
            props: ["state", "rounds"]
        }),
    replay: require("./replay-repo")
};