import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';

chai.should();
chai.use(chaiHttp);

describe('DataBase Response', () => {
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
        it('Response is an array', () => {
            chai.request(app)
                .get("/DIPSS/training-list")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                });
        });
    });

    describe("GET /DIPSS/exercise-list", () => {
        it('Response is an array', () => {
            chai.request(app)
                .get("/DIPSS/exercise-list")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                });
        });
    });

    describe("GET /DIPSS/assignment-list", () => {
        it('Response is an array', () => {
            chai.request(app)
                .get("/DIPSS/assignment-list")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                });
        });
    });

    describe("GET /DIPSS/user-list", () => {
        it('Response is an array', () => {
            chai.request(app)
                .get("/DIPSS/user-list")
                .end((err, response) => {
                    console.log(response.body);
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                });
        });
    });


});