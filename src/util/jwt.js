const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const etc = require("../etc");
const privateKey = require("../etc").privateKey;
const publicKey = require("../etc").publicKey;

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
module.exports.key = publicKey;