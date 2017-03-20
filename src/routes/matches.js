const express = require('express');
const passport = require('passport');
const router = express.Router();
const log = require("bunyan").createLogger({name: "routes/match"});
const matchController = require("../controllers/match");


const isMatchAdmin = (req, res, next) => {
    if (!req.user.roles.includes("matchAdmin")) {
        log.info({user, url: req.url, body: req.body}, "Unauthorized access.");
        res.sendStatus(401);
    } else {
        next();
    }
};

router.use(passport.authenticate("jwt", { session: false }));

router.post("/create",
    isMatchAdmin,
    (req, res) => matchController.create(req.body).then(match => res.json(match))
);

router.put("/:matchId/rounds/:roundNum/replay/:playerId",
    (req, res) => {
        if (req.user.id === req.params.playerId || req.user.roles.includes("matchAdmin")) {
            matchController.saveReplay(req.params.matchId, req.params.roundNum, req.params.playerId, req)
                .then(() => res.sendStatus(204))
                .catch(err => res.sendStatus(500));
        } else {
            res.sendStatus(401);
        }
    }
);

module.exports = router;