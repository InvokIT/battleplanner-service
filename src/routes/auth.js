const express = require('express');
const passport = require('passport');
const router = express.Router();

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
router.get('/steam',
    passport.authenticate('steam', {failureRedirect: '/', session: false}),
    function (req, res) {
        res.redirect('/');
    }
);

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/steam/return',
    passport.authenticate('steam', {failureRedirect: '/', session: false}),
    function (req, res) {
        res.render("auth-response", {
            response: req.user,
            targetOrigin: cfg.clientOrigin
        });
    }
);

router.get("/validate",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.sendStatus(204);
    }
);

module.exports = router;