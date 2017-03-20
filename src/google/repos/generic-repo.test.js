const _isNil = require("lodash/isNil");
const _isString = require("lodash/isString");
const _isArray = require("lodash/isArray");
const uuid = require("uuid/v4");
const expect = require("chai").expect;
const sinon = require("sinon");
const GenericRepo = require("./generic-repo");

const mockDatastore = () => {
    return {
        save: sinon.stub().callsFake(entity => {
            expect(entity.key).to.exist;
            expect(entity.key.path).to.exist;
            expect(entity.key.path[0]).to.exist;

            if (_isNil(entity.key.path[1])) {
                entity.key.path[1] = uuid();
            }

            return Promise.resolve("stub");
        }),
        get: sinon.stub(),
        createQuery: sinon.stub(),
        key: sinon.stub().callsFake(path => {
            expect(path).to.exist;

            if (_isArray(path)) {
                return {path};
            }

            if (_isString(path)) {
                return {path:[path, undefined]};
            }

            return path;
        }),
        KEY: Symbol("KEY")
    };
};

describe("google/repos/generic-repo", () => {

    let repo;
    let ds;

    beforeEach(() => {
        ds = mockDatastore();
        repo = new GenericRepo({
            datastore: ds,
            kind: "Test",
            props: ["intProp", "strProp", "objProp"],
            indexes: ["indexedProp"],
            defaults: {def1: 10, def2: () => "from fn"},
            refs: {"refProp": "ForeignKind"}
        });
    });

    describe("save", () => {
        it("should throw on no model", () => {
            expect(() => repo.save(null)).to.throw();
        });

        it("should save a model with no id and assign a new id", () => {
            const model = {};
            return repo.save(model)
                .then(() => expect(model.id).to.exist);
        });

        it("should assign static defaults to the model", () => {
            const model = {};
            return repo.save(model)
                .then(() => expect(model.def1).to.equal(10));
        });

        it("should assign dynamic defaults to the model", () => {
            const model = {};
            return repo.save(model)
                .then(() => expect(model.def2).to.equal("from fn"));
        });
    });

    describe("get", () => {
        it("should throw when id is not defined", () => {
            expect(() => repo.get(undefined)).to.throw;
        });

        it("should return a model with the idProp assigned from the key value", () => {
            ds.get.resolves([{
                [ds.KEY]: ds.key(["Test", "test-id"]),
                "refProp": ds.key(["ForeignKind", "test-id2"]),

            }]);

            return repo.get("test-id")
                .then(model => {
                    expect(model.id).to.equal("test-id")
                });
        });

        it("should return a model with foreign ids assigned from the key value", () => {
            ds.get.resolves([{
                [ds.KEY]: ds.key(["Test", "test-id"]),
                "refProp": ds.key(["ForeignKind", "test-id2"])
            }]);

            return repo.get("test-id")
                .then(model => {
                    expect(model.refProp).to.equal("test-id2")
                });
        });

        it("should create indexes on indexed properties", () => {
            return repo.save({
                id: "index-test",
                indexedProp: "indexed"
            }).then(() => {
                const argsData = ds.save.lastCall.args[0].data;
                expect(argsData.find(p => p.name === "indexedProp")).to.eql({name: "indexedProp", value: "indexed", excludeFromIndexes: false});
            });
        });

        it("should exclude indexes on non-indexed properties", () => {
            return repo.save({
                id: "index-test",
                strProp: "not indexed"
            }).then(() => {
                const argsData = ds.save.lastCall.args[0].data;
                expect(argsData.find(p => p.name === "strProp")).to.eql({name: "strProp", value: "not indexed", excludeFromIndexes: true});
            });
        });
    });

});