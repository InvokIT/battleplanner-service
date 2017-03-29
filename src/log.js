const bunyan = require("bunyan");

const envLevels = {
    "production": "info",
    "test": "info",
    "debug": "trace"
};

const defaultLevel = process.env.NODE_ENV in envLevels ? envLevels[process.env.NODE_ENV] : "info";

const rootLogger = bunyan.createLogger({
    name: "app",
    level: defaultLevel
});

module.exports = (logName) => rootLogger.child({module:logName});