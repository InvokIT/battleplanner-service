const path = require("path");
const bunyan = require('bunyan');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const authController = require('./controllers/auth');
const jwtOptions = require("./util/jwt").options;

const log = bunyan.createLogger({name: "app"});

const debug = process.env.NODE_ENV !== "production";

const port = process.env.PORT || 8080;
const cfg = {
    hostPort: port,
    publicOrigin: process.env.PUBLIC_ORIGIN || `http://localhost:${port}`,
    steamRealm: process.env.STEAM_REALM || 'http://localhost',
    steamKey: process.env.STEAM_KEY,
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};

passport.use(new SteamStrategy({
    returnURL: `${cfg.publicOrigin}/auth/steam/return`,
    realm: cfg.steamRealm,
    apiKey: cfg.steamKey
}, (identifier, profile, done) => {

    profile.identifier = identifier;

    authController.validateSteamProfile(profile)
        .then(jwt => done(null, jwt), done);
}));

passport.use(new JwtStrategy({
    secretOrKey: require("./util/jwt").key,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    issuer: jwtOptions.issuer,
    algorithms: jwtOptions.algorithms,
    audience: jwtOptions.audience,

}, (jwtPayload, done) => {
    const userId = jwtPayload.sub;
    done(null, userId);
}));

const app = express();

app.set('trust proxy', true);
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(require("cors")({
    origin: cfg.clientOrigin
}));

app.get("/_ah/health", (req, res) => res.sendStatus(200));

app.use("/auth", require("./routes/auth"));
app.use("/matches", require("./routes/matches"));

app.listen(cfg.hostPort);

log.info({config: cfg}, "App started.");