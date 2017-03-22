const log = require('../log')("util/steam");
const _tail = require("lodash/tail");

const updateUserFromSteamProfile = (user, steamProfile) => {
    log.info({user, steamProfile}, "Updating user profile info from steam data.")

    user.steamId = steamProfile.identifier;

    user.avatarUrl = steamProfile._json.avatarfull;
    user.displayName = steamProfile.displayName;

    return user;
};

module.exports.updateUserFromSteamProfile = updateUserFromSteamProfile;