const bunyan = require('bunyan');
const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('./models/user');
const authController = require('./controllers/auth');

const log = bunyan.createLogger({name: "app", level: 'debug'});

const debug = process.env.NODE_ENV !== "production";

const port = process.env.PORT || 8080;
const cfg = {
    hostPort: port,
    publicOrigin: process.env.PUBLIC_URL || `http://localhost:${port}`,
    steamRealm: process.env.STEAM_REALM || 'http://localhost',
    steamKey: process.env.STEAM_KEY,
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};

log.info({config: cfg});

//const authCtrl = new AuthController(userRepo);

passport.use(new SteamStrategy({
    returnURL: `${cfg.publicOrigin}/auth/steam/return`,
    realm: cfg.steamRealm,
    apiKey: cfg.steamKey
}, (identifier, profile, done) => {

    profile.identifier = identifier;

    authController.validateSteamProfile(profile)
        .then(jwt => done(null, jwt));
}));

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(passport.initialize());

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/auth/steam',
    passport.authenticate('steam', {failureRedirect: '/', session: false}),
    function (req, res) {
        res.redirect('/');
    });

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/steam/return',
    passport.authenticate('steam', {failureRedirect: '/', session: false}),
    function (req, res) {
        res.render("auth-response", {
            response: req.user,
            targetOrigin: cfg.clientOrigin
        });
    });

app.listen(cfg.hostPort);