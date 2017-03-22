const retry = require("async/retry");
const uuid = require("uuid/v4");
const forEach = require("lodash/forEach");
const isFunction = require("lodash/isFunction");
const isNil = require("lodash/isNil");
const isString = require("lodash/isString");
const has = require("lodash/fp/has");

class GenericRepo {
    constructor({documentClient, table, defaults = {}, model, retries = 10}) {
        if (isNil(documentClient)) {
            throw new Error("documentClient is nil.");
        }

        if (!isString(table)) {
            throw new Error("Invalid type of table name.");
        }

        if(!isFunction(model)) {
            throw new Error("model is not a constructor");
        }

        this.documentClient = documentClient;
        this.table = table;
        this.defaults = defaults;
        this.modelClass = model;
        this.retries = retries;
    }

    save(model) {
        return new Promise((resolve, reject) => {
            if (isNil(model)) {
                throw new Error("model is nil.");
            }

            this.assignDefaults(model);

            retry(this.retries, (done) => this.documentClient.put({
                TableName: this.table,
                Item: model
            }, done), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(model);
                }
            });
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            if (isNil(key)) {
                throw new Error("id is nil");
            }

            retry(this.retries, (done) => this.documentClient.get({
                TableName: this.table,
                Key: key
            }, done), (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const model = has("Item", data) ? new (this.modelClass)(data.Item) : null;
                    resolve(model);
                }
            });
        });
    }

    assignDefaults(model) {
        forEach(this.defaults, (value, name) => {
            if (isNil(model[name])) {
                model[name] = isFunction(value) ? value() : value;
            }
        });

        return model;
    }
}

module.exports = GenericRepo;