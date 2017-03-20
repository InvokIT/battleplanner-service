const _transform = require("lodash/transform");
const _isNil = require("lodash/isNil");
const _isArray = require("lodash/isArray");
const _isFunction = require("lodash/isFunction");
const _forEach = require("lodash/forEach");
const log = require('bunyan').createLogger({name: "google/models/GenericRepo"});

class GenericRepo {
    constructor({datastore, kind, id = "id", indexes, props, refs, defaults}) {
        if (_isNil(kind)) {
            throw new Error("kind is nil.");
        }

        if (_isNil(id)) {
            throw new Error("key is nil.");
        }

        if (!_isArray(props) && props.length > 0) {
            throw new Error("no props defined.");
        }

        this.datastore = datastore;
        this.kind = kind;
        this.idProp = id;
        this.indexProps = new Set(indexes);
        this.refs = refs;
        this.defaults = defaults;
        this.validProps = new Set(props.concat(indexes, Object.keys(refs), Object.keys(defaults)));
    }

    save(model) {
        if (_isNil(model)) {
            throw new Error("model is nil.");
        }

        const idProp = this.idProp;
        const key = this.datastore.key([this.kind, model[idProp]]);
        log.debug({key}, "Saving model");

        this.assignDefaults(model);

        const entity = {
            key,
            data: this.modelToEntityData(model)
        };

        return this.datastore.save(entity)
            .then(res => {
                log.debug({response: res}, `Saved entity with kind ${this.kind}.`);

                const entityId = key.path[1];
                model[idProp] = entityId;

                return model;
            });
    }

    get(id) {
        const key = this.datastore.key([this.kind, id]);
        return this.datastore.get(key)
            .then(res => {
                log.debug({response: res}, `Fetched entity of kind ${this.kind} with id ${id}.`);
                return this.entityToModel(res[0]);
            });
    }

    getBy(prop, value) {
        if (prop in this.refs) {
            value = this.datastore.key(this.refs[prop], value);
        }

        return this.datastore.createQuery(this.kind)
            .filter(prop, value)
            .run()
            .then(res => {
                const entities = res[0];
                log.debug({response: res}, `Fetched ${entities.length} entities of kind ${this.kind} that has prop ${prop} with value ${value}.`);

                return entities.map(this.entityToModel.bind(this));
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

    modelToEntityData(model) {
        const idProp = this.idProp;
        const indexes = this.indexProps;
        const refs = this.refs;
        const ds = this.datastore;

        const data = _transform(model, (props, value, name) => {
            // Skip the id property since it's only used in the key for this entity
            if (name !== idProp && this.validProps.has(name)) {
                const refKind = refs[name];
                if (refKind) {
                    if (_isArray(value)) {
                        value = value.map(v => ds.key([refKind, v]));
                    } else {
                        value = ds.key([refKind, value]);
                    }
                }

                props.push({
                    name,
                    value,
                    excludeFromIndexes: !indexes.has(name)
                });
            }

            return props;
        }, []);

        return data;
    }

    entityToModel(entity) {
        return _transform(entity, (model, value, name) => {
            if (this.validProps.has(name)) {
                if (name in this.refs) {
                    log.debug({key: value}, "Transforming foreign key");

                    if (_isArray(value)) {
                        value = value.map(v => v.path[1]);
                    } else {
                        value = value.path[1];
                    }
                }

                model[name] = value;
            }

            return model;
        }, {
            [this.idProp]: entity[this.datastore.KEY].path[1]
        });
    }
}

module.exports = GenericRepo;