const uuid = require("uuid/v4");
const GenericRepo = require("./generic-repo");

const mockDocumentClient = () => {
    return {
        put: sinon.stub().callsFake((param, cb) => {
            expect(param).to.have.property("TableName").to.be.a("string");
            expect(param).to.have.property("Item").to.be.an("object");

            cb(null, {});
        }),
        get: sinon.stub().callsFake((param, cb) => {
            expect(param).to.have.property("TableName").to.be.a("string");
            expect(param).to.have.property("Key").to.be.an("object");

            cb(null, {Item: param.Key});
        })
    };
};

class Model {
    constructor(props) {
        Object.assign(this, props);
    }
}

describe("amazon/repos/generic-repo", () => {

    let repo;
    let dc;

    beforeEach(() => {
        dc = mockDocumentClient();
        repo = new GenericRepo({
            documentClient: dc,
            table: "Test",
            defaults: {def1: 10, def2: () => "from fn"},
            model: Model
        });
    });

    describe("save", () => {
        it("should throw on no model", () => {
            return expect(repo.save(null)).to.be.rejected;
        });

        it("should assign static defaults to the model", () => {
            const model = {};
            return expect(repo.save(model)).to.eventually.have.property("def1").to.equal(10);
        });

        it("should assign dynamic defaults to the model", () => {
            const model = {};
            return expect(repo.save(model)).to.eventually.have.property("def2").to.equal("from fn");
        });

    });

    describe("get", () => {
        it("should throw when id is not defined", () => {
            return expect(repo.get(undefined)).to.be.rejected;
        });

        it("should return null when a model with the requested id is not found", () => {
            dc.get.callsArgWith(1, null, {});

            return expect(repo.get({id: "i-do-not-exist"})).to.eventually.not.exist;
        });

        it("should return a model with the requested id", () => {
            const model = {
                id: "test-id",
                p1: "v1",
                p2: "v2"
            };

            dc.get.callsArgWith(1, null, {
                Item: model
            });

            return expect(repo.get("test-id")).to.eventually.eql(model);
        });

    });

});