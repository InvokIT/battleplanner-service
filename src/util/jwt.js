const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

let privateKey;
let publicKey;

const jwtOptions = {
    algorithm: "RS256",
    expiresIn: "7d",
    issuer: "invokit.dk"
};

const createJwtForUser = (user) => {
    return jwt.sign({
        steamId: user.steamId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        roles: user.roles || []
    }, privateKey, Object.assign({}, jwtOptions, {subject: user.id}));
};

const validateJwt = (token) => {
    const decoded = jwt.verify(token, publicKey, jwtOptions);
    const userId = decoded.sub;
    return userId;
};

module.exports.createJwtForUser = createJwtForUser;
module.exports.validateJwt = validateJwt;
module.exports.options = Object.assign({algorithms: ["RS256"]}, jwtOptions);
module.exports.setKeys = (_privateKey, _publicKey) => {
    privateKey = _privateKey;
    publicKey = _publicKey;
};
module.exports.getPublicKey = () => publicKey;