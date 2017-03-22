const uuid = require("uuid/v4");
const expect = require("chai").expect;
const base64 = require("base-64");
const _ = require("lodash");
const User = require("../models/user");
const createJwtForUser = require("./jwt").createJwtForUser;
const fs = require("fs");
const path = require("path");

require("./jwt").setKeys(
    fs.readFileSync(path.join(__dirname, "../ssl/private_key.pem")),
    fs.readFileSync(path.join(__dirname, "../ssl/public_key.pem"))
);

describe("util/jwt", () => {

    let user;

    beforeEach(() => {
        user = new User({
            displayName: "test-user",
            avatarUrl: "http://example.com",
            steamId: uuid()
        });
    });

    describe("createJwtForUser", () => {

        it("should include user id in jwt", () => {
            const jwt = createJwtForUser(user);
            const decodedPayload = JSON.parse(base64.decode(jwt.split(".")[1]));
            expect(decodedPayload.sub).to.equal(user.id);
        });

        it("should include displayName in jwt", () => {
            const jwt = createJwtForUser(user);
            const decodedPayload = JSON.parse(base64.decode(jwt.split(".")[1]));
            expect(decodedPayload.displayName).to.equal(user.displayName);
        });

        it("should include steamId in jwt", () => {
            const jwt = createJwtForUser(user);
            const decodedPayload = JSON.parse(base64.decode(jwt.split(".")[1]));
            expect(decodedPayload.steamId).to.equal(user.steamId);
        });

        it("should include avatarUrl in jwt", () => {
            const jwt = createJwtForUser(user);
            const decodedPayload = JSON.parse(base64.decode(jwt.split(".")[1]));
            expect(decodedPayload.avatarUrl).to.equal(user.avatarUrl);
        });

        it("should not include anything else in jwt payload", () => {
            const jwt = createJwtForUser(user);
            const decodedPayload = JSON.parse(base64.decode(jwt.split(".")[1]));

            const allowedKeys = ["sub", "displayName", "steamId", "steamIdentifier", "avatarUrl", "roles", "iat", "exp", "iss"];

            const keyDiff = _(decodedPayload).keys().difference(allowedKeys).value();

            expect(keyDiff.length).to.equal(0);
        });

    });

    describe("getUserFromJwtPayload", () => {

        const getUserFromJwtPayload = require("./jwt").getUserFromJwtPayload;

        it("should return instance of user in jwtPayload", () => {
            const jwt = createJwtForUser(user);
            const jwtParts = jwt.split(".");

            const decodedPayload = JSON.parse(base64.decode(jwtParts[1]));

            expect(getUserFromJwtPayload(decodedPayload)).to.eql(user);
        });
    });

});