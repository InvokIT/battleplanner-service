const uuid = require("uuid/v4");
const expect = require("chai").expect;
const base64 = require("base-64");
const _ = require("lodash");

const createJwtForUser = require("./jwt").createJwtForUser;

describe("util/jwt", () => {

    let user;

    beforeEach(() => {
        user = {
            id: uuid(),
            displayName: "test-user",
            avatarUrl: "http://example.com",
            steamId: uuid()
        };
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

    describe("validateJwt", () => {

        const validateJwt = require("./jwt").validateJwt;

        let jwt;

        beforeEach(() => {
            jwt = createJwtForUser(user);
        });

        it("should throw on a tampered jwt", () => {
            const jwtParts = jwt.split(".");

            const decodedPayload = JSON.parse(base64.decode(jwtParts[1]));
            decodedPayload.sub = uuid();

            jwtParts[1] = base64.encode(JSON.stringify(decodedPayload));

            const tamperedJwt = jwtParts.join(".");

            expect(() => validateJwt(tamperedJwt)).to.throw;
        });

        it("should return user id of user in token", () => {
            expect(validateJwt(jwt)).to.equal(user.id);
        });
    });

});