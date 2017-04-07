const awsBoot = require("./amazon/boot");
const setJwtKeys = require("./util/jwt").setKeys;

module.exports = () => {
    return Promise.all([
        awsBoot.getPrivateKey(),
        awsBoot.getPublicKey()
    ]).then(keys => setJwtKeys.apply(null, keys));
};