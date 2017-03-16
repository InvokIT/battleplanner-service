const _ = require("lodash");

const updateUserFromSteamProfile = (user, steamProfile) => {
    user.steam = {
        id: steamProfile.id,
        identifier: steamProfile.identifier
    };

    user.avatarUrl = _.last(steamProfile.photos).value;
    user.displayName = steamProfile.displayName;

    return user;
};

module.exports.updateUserFromSteamProfile = updateUserFromSteamProfile;