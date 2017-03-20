const express = require('express');
const passport = require('passport');
const router = express.Router();
const _get = require("lodash/get");
const log = require("bunyan").createLogger({name: "routes/match"});
const matchController = require("../controllers/match");


const isMatchAdmin = (req, res, next) => {
    if (!_get(req.user, "roles.matchAdmin")) {
        log.info({user, url: req.url, body: req.body}, "Unauthorized access.");
        res.sendStatus(401);
    } else {
        next();
    }
};

router.use(passport.authenticate("jwt", { session: false }));
router.use(isMatchAdmin);

router.post("/create",
    (req, res) => matchController.create(req.body).then(match => res.json(match))
);

module.exports = router;