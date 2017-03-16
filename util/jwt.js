const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const privateKey = fs.readFileSync(path.join(__dirname, "../ssl/private_key.pem"));
const publicKey = fs.readFileSync(path.join(__dirname, "../ssl/public_key.pem"));

const jwtOptions = {
    algorithm: "RS256",
    expiresIn: "7d",
    issuer: "invokit.dk"
};

const createJwtForUser = (user) => {
    return jwt.sign({
        steamId: user.steam.id,
        steamIdentifier: user.steam.identifier,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
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