const _transform = require("lodash/transform");
const _isNil = require("lodash/isNil");
const _isArray = require("lodash/isArray");
const _isFunction = require("lodash/isFunction");
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
        const idProp = this.idProp;
        const key = this.datastore.key([this.kind, model[idProp]]);

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
        const key = this.datastore.key(this.kind, id);
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

    modelToEntityData(model) {
        const idProp = this.idProp;
        const indexes = this.indexProps;
        const refs = this.refs;
        const defs = this.defaults;
        const ds = this.datastore;

        const data = _transform(model, (props, value, name) => {
            // Skip the id property since it's only used in the key for this entity
            if (name !== idProp && this.validProps.has(name)) {
                const def = defs[name];
                if (_isNil(value) && def) {
                    value = _isFunction(def) ? def() : def;
                }

                const ref = refs[name];
                if (ref) {
                    value = ds.key(ref, value);
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
            if (name in this.validProps) {
                if (name in this.refs) {
                    value = value.path[1];
                }

                model[name] = value;
            }
        }, {
            [this.idProp]: entity[this.datastore.KEY].path[1]
        });
    }
}

export default GenericRepo;