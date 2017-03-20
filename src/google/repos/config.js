const GenericRepo = require("./generic-repo");
const Datastore = require('@google-cloud/datastore');

const projectId = process.env.PROJECT_ID;

const datastore = Datastore({
    projectId: projectId
});

module.exports = {
    user: new (require("./user-repo"))({datastore}),
    match: new GenericRepo(
        {
            kind: "match",
            props: ["state", "rounds"]
        })
};