const express = require('express');
const passport = require('passport');
const router = express.Router();
const log = require("../log")("routes/users");
const usersController = require("../controllers/users");

router.use(passport.authenticate("jwt", {session: false}));

router.get("/:userId",
    (req, res) => {
        usersController.getUser(req.params.userId)
            .then(user => {
                if (user) {
                    res.json(user);
                } else {
                    res.sendStatus(404);
                }
            })
            .catch(err => {
                log.error(err);
                res.sendStatus(500);
            });
    }
);

module.exports = router;