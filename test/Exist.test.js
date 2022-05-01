// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import app from '../app.js';
//
// chai.should();
// chai.use(chaiHttp);
//
// describe('Login errors', () => {
//     describe("Email from not register user", () => {
//         it('Cannot find the user in DataBase', () => {
//             let data = {
//                 email: 'admin@admin.admin',
//                 password: 'Password1@'
//             }
//             chai.request(app)
//                 .post("/DIPSS/login")
//                 .end((err, response) => {
//                     console.log(response.body);
//                     response.body.message.should.exist;
//                 });
//         });
//     });
//     // describe("Wrong password", () => {
//     //     it('Cannot connect : wrong password', () => {
//     //         let data = {
//     //             email: 'test@test.com',
//     //             password: 'Password1@'
//     //         }
//     //         chai.request(app)
//     //             .post("/DIPSS/login")
//     //             .end((err, response) => {
//     //                 response.should.have.status(200);
//     //                 response.body.message.should.exist
//     //             });
//     //     });
//     // });
//
// });