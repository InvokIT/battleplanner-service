const express = require('express');
const passport = require('passport');
const router = express.Router();
const httpStatus = require("http-status");
const log = require("../log")("routes/matches");
const matchController = require("../controllers/match");


// const isMatchAdmin = (req, res, next) => {
//     if (!req.user.roles.includes("matchAdmin")) {
//         log.info({user, url: req.url, body: req.body}, "Unauthorized access.");
//         res.sendStatus(401);
//     } else {
//         next();
//     }
// };

router.use(passport.authenticate("jwt", {session: false}));

router.post(
    "/",
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

module.exports = router;