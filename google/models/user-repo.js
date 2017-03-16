module.exports = {
    save(user) {
        return Promise.resolve(user);
    },

    getById(id) {
        return Promise.resolve(null);
    },

    findOneBySteamId(steamId) {
        return Promise.resolve(null);
    }
};