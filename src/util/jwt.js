const jwt = require("jsonwebtoken");
const pick = require("lodash/fp/pick");
const set = require("lodash/fp/set");
const flow = require("lodash/fp/flow");
const User = require("../models/user");

let privateKey;
let publicKey;

const jwtOptions = {
    algorithm: "RS256",
    expiresIn: "7d",
    issuer: "invokit.dk"
};

const createJwtForUser = (user) => {
    return jwt.sign(
        pick(["steamId", "displayName", "avatarUrl", "roles"], user),
        privateKey,
        Object.assign({subject: user.id}, jwtOptions));
};

const getUserFromJwtPayload = (jwtPayload) => {
    return new User(
        flow(
            pick(["steamId", "displayName", "avatarUrl", "roles"]),
            set("id", jwtPayload.sub)
        )(jwtPayload)
    );
};

module.exports.createJwtForUser = createJwtForUser;
module.exports.getUserFromJwtPayload = getUserFromJwtPayload;
module.exports.options = Object.assign({algorithms: ["RS256"]}, jwtOptions);
module.exports.setKeys = (_privateKey, _publicKey) => {
    privateKey = _privateKey;
    publicKey = _publicKey;
};
module.exports.getPublicKey = () => publicKey;