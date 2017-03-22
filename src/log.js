const bunyan = require("bunyan");

const defaultLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

const rootLogger = bunyan.createLogger({
    name: "app",
    level: defaultLevel
});

module.exports = (logName) => rootLogger.child({module:logName});