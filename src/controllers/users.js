const _pick = require("lodash/pick");
const users = require("../repos/user");

const publicUserProps = [
    "id",
    "displayName",
    "steamId",
    "avatarUrl"
];

module.exports = {
    getUser(userId) {
        return users.get({id: userId}).then(user => _pick(user, publicUserProps));
    }
};
