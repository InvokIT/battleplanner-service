const uuid = require("uuid/v4");
const _forEach = require("lodash/forEach");
const _isFunction = require("lodash/isFunction");
const _isNil = require("lodash/isNil");
const _isString = require("lodash/isString");

class GenericRepo {
    constructor({documentClient, table, defaults = {}}) {
        if (_isNil(documentClient)) {
            throw new Error("documentClient is nil.");
        }

        if (!_isString(table)) {
            throw new Error("Invalid type of table name.");
        }

        this.documentClient = documentClient;
        this.table = table;
        this.defaults = defaults;
    }

    save(model) {
        return new Promise((resolve, reject) => {
            if (_isNil(model)) {
                throw new Error("model is nil.");
            }

            this.assignDefaults(model);

            this.documentClient.put({
                TableName: this.table,
                Item: model
            }, (err) => {
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
            if (_isNil(key)) {
                throw new Error("id is nil");
            }

            this.documentClient.get({
                TableName: this.table,
                Key: key
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Item);
                }
            });
        });
    }

    assignDefaults(model) {
        _forEach(this.defaults, (value, name) => {
            if (_isNil(model[name])) {
                model[name] = _isFunction(value) ? value() : value;
            }
        });

        return model;
    }
}
module.exports = GenericRepo;