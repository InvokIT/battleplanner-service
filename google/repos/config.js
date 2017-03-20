const GenericRepo = require("./generic-repo");

module.exports = {
    user: new require("./user-repo"),
    match: new GenericRepo(
        {
            kind: "match",
            props: ["state", "rounds"]
        })
};