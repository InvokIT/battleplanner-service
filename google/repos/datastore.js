const Datastore = require('@google-cloud/datastore');
const projectId = process.env.PROJECT_ID;

const datastore = Datastore({
    projectId: projectId
});

module.exports = datastore;