import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';

chai.should();
chai.use(chaiHttp);

describe('Requests API', () => {
    describe("GET /DIPSS/login", () => {
        it('Response is a booléan', () => {
            chai.request(app)
                .get("/DIPSS/login")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.loggedIn.should.be.a('boolean');
                });
        });
    });

    describe("GET /DIPSS/training-list", () => {
        it('Response is a booléan', () => {
            chai.request(app)
                .get("/DIPSS/training-list")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                });
        });
    });


});