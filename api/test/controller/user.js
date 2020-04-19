/**
 * Integration tests for the /user controller
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import chai from 'chai';
import chaiHttp from 'chai-http';
import Mongoose from 'mongoose';
import mock from 'mock-mongoose';
import { generateToken } from '../../dist/service/auth.js';

chai.use(chaiHttp);

const mockMongoose = new mock.MockMongoose(Mongoose);

let app;
before(async () => {
  await mockMongoose.prepareStorage();
  app = await import('../../dist/main.js');
});

describe('User Controller', () => {

  const goodPut = {
    displayName: 'The Dude',
    password: 'TheDudeAbides',
    email: 'thedude@lebowski.com'
  };

  // user registration tests
  describe('register', () => {

    before(async () => mockMongoose.helper.reset());

    it('needs a valid username', async () => {
      const res = await chai
        .request(app.default)
        .put('/user/d')
        .send(goodPut);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('username');
    });

    it('needs a valid email', async () => {
      const res = await chai
        .request(app.default)
        .put('/user/dude')
        .send(Object.assign({}, goodPut, { email: 'invalid' }));
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('email');
    });

    it('needs a valid displayName', async () => {
      const res = await chai
        .request(app.default)
        .put('/user/dude')
        .send(Object.assign({}, goodPut, { displayName: '' }));
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('displayName');
    });

    it('works when everything is good', async () => {
      const res = await chai
        .request(app.default)
        .put('/user/dude')
        .send(goodPut);
      chai.expect(res).to.have.status(200);
    });

    it(`won't insert duplicate emails`, async () => {
      const res = await chai
        .request(app.default)
        .put('/user/dude1')
        .send(goodPut);
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('email');
    });

    it(`won't insert duplicate usernames`, async () => {
      const res = await chai
        .request(app.default)
        .put('/user/dude')
        .send(Object.assign({}, goodPut, { email: 'dude1@lebowski.com' }));
      chai.expect(res).to.have.status(422);
      chai.expect(res.body.errors).to.have.length(1);
      chai.expect(res.body.errors[0].param).to.equal('username');
    });

  });

  // user auth tests
  describe('auth', () => {

    before(async () => {
      await mockMongoose.helper.reset();
      await chai
        .request(app.default)
        .put('/user/dude')
        .send(goodPut);
    });

    it('should fail for an invalid username/email', async () => {
      const res = await chai
        .request(app.default)
        .post('/user/dude/token')
        .send({
          user: 'flynn@thearcade.com',
          password: goodPut.password
        });
      chai.expect(res).to.have.status(401);
    });

    it('should fail for an invalid password', async () => {
      const res = await chai
        .request(app.default)
        .post('/user/dude/token')
        .send({
          user: goodPut.email,
          password: 'JustLikeYourOpinion'
        });
      chai.expect(res).to.have.status(401);
    });

    it('should return a token for valid email/password', async () => {
      const res = await chai
        .request(app.default)
        .post('/user/dude/token')
        .send({
          user: goodPut.email,
          password: goodPut.password
        });
      chai.expect(res).to.have.status(200);
      chai.expect(res.body.token).to.not.be.empty;
    });

    let token;
    it('should return a token for valid username/password', async () => {
      const res = await chai
        .request(app.default)
        .post('/user/dude/token')
        .send({
          user: 'dude',
          password: goodPut.password
        });
      chai.expect(res).to.have.status(200);
      token = res.body.token;
      chai.expect(token).to.not.be.empty;
    });

    it('should prevent private access without a token', async () => {
      const res = await chai
        .request(app.default)
        .get('/user/dude/private');
      chai.expect(res).to.have.status(401);
    });

    it('should prevent private access from other users', async () => {
      const badToken = await generateToken('Donny');
      const res = await chai
        .request(app.default)
        .get('/user/dude/private')
        .set('Authorization', `Bearer ${badToken}`);
      chai.expect(res).to.have.status(401);
    });

    it('should allow access with a valid token', async () => {
      const res = await chai
        .request(app.default)
        .get('/user/dude/private')
        .set('Authorization', `Bearer ${token}`);
      chai.expect(res).to.have.status(200);
    });

  });

});