const _tail = require("lodash/");

const updateUserFromSteamProfile = (user, steamProfile) => {
    user.steamId = steamProfile.identifier;

    user.avatarUrl = _tail(steamProfile.photos).value;
    user.displayName = steamProfile.displayName;

    return user;
};

module.exports.updateUserFromSteamProfile = updateUserFromSteamProfile;