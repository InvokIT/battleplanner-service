const users = require("../repos/user");
const createJwtForUser = require("../util/jwt").createJwtForUser;
const getUserFromJwt = require("../util/jwt").getUserFromJwt;
const updateUserFromSteamProfile = require("../util/steam").updateUserFromSteamProfile;

module.exports = {

    validateSteamProfile(steamProfile) {
        // A Steam Profile always validates. If a user doesn't exist, create one
        const steamId = steamProfile.identifier;

        return users.getBySteamId(steamId)
            // Create new user if none found
            .then(user => user || {})
            // Update profile data
            .then(user => updateUserFromSteamProfile(user, steamProfile))
            .then(user => user.save())
            .then(createJwtForUser);
    },

    validateJwt(jwt) {
        return getUserFromJwt(jwt);
    }

};