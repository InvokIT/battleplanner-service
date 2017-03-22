const uuid = require("uuid/v4");
const MatchRepo = require("./match-repo");

const mockDocumentClient = () => {
    return {
        put: sinon.stub().yields(),
        get: sinon.stub().yields(),
        batchGet: sinon.stub().yields(),
        delete: sinon.stub().yields()
    };
};

describe("amazon/repos/match-repo", () => {

    let repo;
    let dc;

    beforeEach(() => {
        dc = mockDocumentClient();
        repo = new MatchRepo({
            documentClient: dc,
            table: "Test",
            historyTable: "TestHistory"
        });
    });

    describe("save", () => {
        it("should put to 'table' if active", () => {
            dc.put = sinon.stub().callsFake((params, done) => {
                expect(params).to.have.property("TableName").to.equal(repo.table);
                done(null, {});
            });

            return repo.save(new (repo.modelClass)({active: true}));
        });

        it("should delete from 'table' if not active", () => {
            dc.delete = sinon.stub().callsFake((params, done) => {
                expect(params).to.have.property("TableName").to.equal(repo.table);
                done(null, {});
            });

            return repo.save(new (repo.modelClass)({active: false}));
        });

        it("should delete from 'historyTable' if active", () => {
            dc.delete = sinon.stub().callsFake((params, done) => {
                expect(params).to.have.property("TableName").to.equal(repo.historyTable);
                done(null, {});
            });

            return repo.save(new (repo.modelClass)({active: true}));
        });

        it("should put to 'historyTable' if not active", () => {
            dc.put = sinon.stub().callsFake((params, done) => {
                expect(params).to.have.property("TableName").to.equal(repo.historyTable);
                done(null, {});
            });

            return repo.save(new (repo.modelClass)({active: false}));
        });

    });

    describe("get", () => {
        it("should batch get from both 'table' and 'historyTable'", () => {
            const key = {id: "test-id"};
            dc.batchGet = sinon.stub().callsFake((params, done) => {
                expect(params.RequestItems).to.have.property(repo.table).to.have.property("Keys").to.contain(key);
                expect(params.RequestItems).to.have.property(repo.historyTable).to.have.property("Keys").to.contain(key);

                done(null, {Items: [key]});
            });

            return repo.get(key);
        });

        it("should return a single match", () => {
            const key = {id: "test-id"};
            dc.batchGet = sinon.stub().yields(null, {
                Responses: {
                    [repo.table]: [],
                    [repo.historyTable]: [key]
                }
            });

            return expect(repo.get(key)).to.eventually.eql(new (repo.modelClass)(key));
        });
    });

});