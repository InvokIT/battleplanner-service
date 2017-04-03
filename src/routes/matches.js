const express = require('express');
const passport = require('passport');
const router = express.Router();
const httpStatus = require("http-status");
const log = require("../log")("routes/matches");
const matchController = require("../controllers/match");
const matchLobbyController = require("../controllers/match-lobby");
const jwtUtil = require("../util/jwt");

// const isMatchAdmin = (req, res, next) => {
//     if (!req.user.roles.includes("matchAdmin")) {
//         log.info({user, url: req.url, body: req.body}, "Unauthorized access.");
//         res.sendStatus(401);
//     } else {
//         next();
//     }
// };

// router.use(passport.authenticate("jwt", {session: false}));

const jwtAuthHeaderSecurity = () => passport.authenticate("jwt", {session: false});

router.post(
    "/",
    jwtAuthHeaderSecurity(),
    // isMatchAdmin,
    (req, res) => {
        const matchArgs = req.body;
        matchArgs.owner = req.user.id;

        matchController.create(matchArgs)
            .then(match => res.json(match))
            .catch(err => {
                log.error(err);
                res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
            });
    }
);

router.put(
    "/:matchId/rounds/:roundNum/replays/:playerId",
    jwtAuthHeaderSecurity(),
    (req, res) => {
        if (req.user.id === req.params.playerId || req.user.roles.includes("matchAdmin")) {
            matchController.saveReplay(req.params.matchId, req.params.roundNum, req.params.playerId, req)
                .then(() => res.sendStatus(httpStatus.NO_CONTENT))
                .catch(err => {
                    log.error(err);
                    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
                });
        } else {
            res.sendStatus(httpStatus.FORBIDDEN);
        }
    }
);

router.get(
    "/",
    jwtAuthHeaderSecurity(),
    (req, res) => {
        const user = req.user;
        matchController.getMatchesForUser(user)
            .then(matches => {
                log.info()
                res.json(matches);
            })
            .catch(err => {
                log.error(err);
                res.sendStatus(500);
            });
    }
);

router.ws(
    "/:matchId",
    (ws, req) => {
        const matchId = req.params.matchId;

        log.trace({matchId}, "Someone connected to match lobby, waiting for auth message.");

        // Listen for the first message, which must be a valid authorization message
        ws.once("message", (msg) => {
            try {
                const data = JSON.parse(msg);
                if (data.type === "auth") {
                    const token = data.token;
                    const user = jwtUtil.getUserFromEncodedJwt(token);

                    ws.send(JSON.stringify({
                        type: "auth-response",
                        success: true
                    }));

                    log.info({user, matchId}, "Websocket successfully authenticated.");

                    matchLobbyController(matchId).userConnected(user, ws);
                } else {
                    throw new Error(`Received message with type '${data.type}', expected 'auth'.`);
                }
            } catch (err) {
                log.warn(err, "Error while authenticating websocket connection.");
                ws.close();
            }
        });

        ws.on("error", err => log.error(err, "Websocket error"));
    }
);

module.exports = router;