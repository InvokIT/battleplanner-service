const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

global["chaiAsPromised"] = chaiAsPromised;
global.expect = chai.expect;
global.sinon = require("sinon");
