const bunyan = require("bunyan");

const envLevels = {
    "production": "info",
    "test": 100,
    "debug": "debug",
    "dev": 0
};

const defaultLevel = process.env.NODE_ENV in envLevels ? envLevels[process.env.NODE_ENV] : "info";

const rootLogger = bunyan.createLogger({
    name: "app",
    level: defaultLevel
});

module.exports = (logName) => rootLogger.child({module:logName});