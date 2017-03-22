const users = require("../repos/user");
const createJwtForUser = require("../util/jwt").createJwtForUser;
const getUserFromJwtPayload = require("../util/jwt").getUserFromJwtPayload;
const updateUserFromSteamProfile = require("../util/steam").updateUserFromSteamProfile;
const User = require("../models/user");

module.exports = {

    validateSteamProfile(steamProfile) {
        // A Steam Profile always validates. If a user doesn't exist, create one
        const steamId = steamProfile.identifier;

        return users.getBySteamId(steamId)
        // Create new user if none found
            .then(user => user || new User())
            // Update profile data
            .then(user => updateUserFromSteamProfile(user, steamProfile))
            .then(user => users.save(user))
            .then(createJwtForUser);
    },

    getUserFromJwtPayload(jwtPayload) {
        return getUserFromJwtPayload(jwtPayload);
    }

};